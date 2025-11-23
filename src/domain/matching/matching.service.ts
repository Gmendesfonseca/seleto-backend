import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MatchingServiceInterface } from './interfaces/matching.service.interface';
import { CandidateVacancyMatchRepository } from './interfaces/candidate-vacancy-match.repository.interface';
import { CandidateVacancyMatch } from './interfaces/candidate-vacancy-match.interface';
import { Person } from '../persons/person.model';
import { Vacancy } from '../vacancies/vacancy.model';
import { PersonCompetence, ProficiencyLevel } from '../persons/person-competence.model';
import {
  VacancyCompetenceRequirement,
  RequirementPriority,
} from '../competences/vacancy-competence-requirement.model';
import { PersonExperience } from '../persons/person-experience.model';
import { PersonFormation } from '../persons/person-formation.model';

@Injectable()
export class MatchingService implements MatchingServiceInterface {
  private readonly logger = new Logger(MatchingService.name);

  // Weights for different matching criteria (total should be 100)
  private readonly WEIGHTS = {
    COMPETENCE: 40,
    EXPERIENCE: 25,
    EDUCATION: 15,
    LOCATION: 10,
    SALARY: 10,
  };

  // Proficiency level scores
  private readonly PROFICIENCY_SCORES = {
    [ProficiencyLevel.BEGINNER]: 25,
    [ProficiencyLevel.INTERMEDIATE]: 50,
    [ProficiencyLevel.ADVANCED]: 75,
    [ProficiencyLevel.EXPERT]: 100,
  };

  // Priority weights for competence requirements
  private readonly PRIORITY_WEIGHTS = {
    [RequirementPriority.REQUIRED]: 3,
    [RequirementPriority.PREFERRED]: 2,
    [RequirementPriority.NICE_TO_HAVE]: 1,
  };

  constructor(
    @Inject(CandidateVacancyMatchRepository)
    private readonly repository: CandidateVacancyMatchRepository,
    @InjectModel(Person)
    private readonly personModel: typeof Person,
    @InjectModel(Vacancy)
    private readonly vacancyModel: typeof Vacancy,
  ) {}

  async calculateMatch(personId: string, vacancyId: string): Promise<CandidateVacancyMatch> {
    this.logger.debug('MatchingService.calculateMatch: Called');

    // Fetch person with all related data
    const person = await this.personModel.findByPk(personId, {
      include: [
        { model: PersonCompetence, as: 'competences' },
        { model: PersonExperience, as: 'experiences' },
        { model: PersonFormation, as: 'formations' },
      ],
    });

    if (!person) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }

    // Fetch vacancy with all related data
    const vacancy = await this.vacancyModel.findByPk(vacancyId, {
      include: [{ model: VacancyCompetenceRequirement, as: 'competence_requirements' }],
    });

    if (!vacancy) {
      throw new NotFoundException(`Vacancy with id ${vacancyId} not found`);
    }

    // Calculate individual scores
    const competenceScore = this.calculateCompetenceMatch(person, vacancy);
    const experienceScore = this.calculateExperienceMatch(person, vacancy);
    const educationScore = this.calculateEducationMatch(person, vacancy);
    const locationScore = this.calculateLocationMatch(person, vacancy);
    const salaryScore = this.calculateSalaryMatch(person, vacancy);

    // Calculate weighted overall score
    const matchScore =
      (competenceScore.score * this.WEIGHTS.COMPETENCE +
        experienceScore * this.WEIGHTS.EXPERIENCE +
        educationScore * this.WEIGHTS.EDUCATION +
        locationScore * this.WEIGHTS.LOCATION +
        salaryScore * this.WEIGHTS.SALARY) /
      100;

    const matchData: Partial<CandidateVacancyMatch> = {
      personId,
      vacancyId,
      matchScore: Math.round(matchScore * 100) / 100,
      scoreBreakdown: {
        competence_match: competenceScore.score,
        experience_match: experienceScore,
        education_match: educationScore,
        location_match: locationScore,
        salary_match: salaryScore,
      },
      matchedCompetencesCount: competenceScore.matchedCount,
      requiredCompetencesCount: competenceScore.requiredCount,
      totalCompetencesCount: competenceScore.totalCount,
      calculatedAt: new Date(),
    };

    return this.repository.upsert(matchData);
  }

  async recalculateMatch(matchId: string): Promise<CandidateVacancyMatch> {
    this.logger.debug('MatchingService.recalculateMatch: Called');
    const match = await this.repository.findOne(matchId);
    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} not found`);
    }
    return this.calculateMatch(match.personId, match.vacancyId);
  }

  async findMatchesForVacancy(
    vacancyId: string,
    minScore?: number,
    limit: number = 50,
  ): Promise<CandidateVacancyMatch[]> {
    this.logger.debug('MatchingService.findMatchesForVacancy: Called');
    return this.repository.findAll({
      vacancyId,
      minScore: minScore ?? 0,
      limit,
    });
  }

  async findMatchesForPerson(
    personId: string,
    minScore?: number,
    limit: number = 50,
  ): Promise<CandidateVacancyMatch[]> {
    this.logger.debug('MatchingService.findMatchesForPerson: Called');
    return this.repository.findAll({
      personId,
      minScore: minScore ?? 0,
      limit,
    });
  }

  async getBestMatchForVacancy(vacancyId: string): Promise<CandidateVacancyMatch | null> {
    this.logger.debug('MatchingService.getBestMatchForVacancy: Called');
    const matches = await this.findMatchesForVacancy(vacancyId, 0, 1);
    return matches.length > 0 ? matches[0] : null;
  }

  // Private helper methods for calculating individual match scores

  private calculateCompetenceMatch(
    person: Person,
    vacancy: Vacancy,
  ): {
    score: number;
    matchedCount: number;
    requiredCount: number;
    totalCount: number;
  } {
    const personCompetences = (person as any).competences || [];
    const vacancyRequirements = (vacancy as any).competence_requirements || [];

    if (vacancyRequirements.length === 0) {
      return { score: 100, matchedCount: 0, requiredCount: 0, totalCount: 0 };
    }

    let totalWeightedScore = 0;
    let totalPossibleScore = 0;
    let matchedCount = 0;
    let requiredCount = 0;

    // Count required competences
    requiredCount = vacancyRequirements.filter(
      (req: any) => req.priority === RequirementPriority.REQUIRED,
    ).length;

    for (const requirement of vacancyRequirements) {
      const priorityWeight = this.PRIORITY_WEIGHTS[requirement.priority as RequirementPriority];
      totalPossibleScore += priorityWeight * 100;

      const personComp = personCompetences.find(
        (pc: any) => pc.competence_id === requirement.competence_id,
      );

      if (personComp) {
        matchedCount++;
        const proficiencyScore =
          this.PROFICIENCY_SCORES[personComp.proficiency_level as ProficiencyLevel];

        // Check years of experience requirement
        let experienceMultiplier = 1;
        if (requirement.minimum_years_experience && personComp.years_of_experience) {
          if (personComp.years_of_experience < requirement.minimum_years_experience) {
            experienceMultiplier =
              personComp.years_of_experience / requirement.minimum_years_experience;
          }
        }

        totalWeightedScore += priorityWeight * proficiencyScore * experienceMultiplier;
      }
    }

    const score = totalPossibleScore > 0 ? (totalWeightedScore / totalPossibleScore) * 100 : 0;

    return {
      score: Math.round(score * 100) / 100,
      matchedCount,
      requiredCount,
      totalCount: vacancyRequirements.length,
    };
  }

  private calculateExperienceMatch(person: Person, vacancy: Vacancy): number {
    const personExperiences = (person as any).experiences || [];

    if (personExperiences.length === 0) {
      return 50; // Neutral score if no experience data
    }

    // Calculate total years of experience
    let totalYears = 0;
    for (const exp of personExperiences) {
      const startDate = new Date(exp.start_date);
      const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
      const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += years;
    }

    // Match against vacancy level requirements
    const levelExperienceMap = {
      entry: 0,
      junior: 1,
      mid: 3,
      senior: 5,
      lead: 8,
    };

    const requiredYears = levelExperienceMap[vacancy.level as keyof typeof levelExperienceMap] || 0;

    if (totalYears >= requiredYears) {
      // Over-qualified candidates get slightly lower scores
      const overQualificationPenalty = Math.min((totalYears - requiredYears) / requiredYears, 0.2);
      return Math.max(70, 100 - overQualificationPenalty * 30);
    } else {
      // Under-qualified
      return Math.max(0, (totalYears / requiredYears) * 100);
    }
  }

  private calculateEducationMatch(person: Person, _vacancy: Vacancy): number {
    const personFormations = (person as any).formations || [];

    if (personFormations.length === 0) {
      return 60; // Neutral-low score if no education data
    }

    // Simple education match - can be enhanced based on vacancy requirements
    // For now, having any education is positive
    const hasHigherEducation = personFormations.some(
      (f: any) =>
        f.degree_type === 'bachelor' || f.degree_type === 'master' || f.degree_type === 'doctorate',
    );

    return hasHigherEducation ? 100 : 75;
  }

  private calculateLocationMatch(person: Person, vacancy: Vacancy): number {
    // If vacancy is remote, location is not a factor
    if (vacancy.work_mode === 'remote') {
      return 100;
    }

    // If we don't have location data, return neutral score
    if (!vacancy.location) {
      return 70;
    }

    // For hybrid/onsite, would need to compare locations
    // Simplified: if person has no location data, return lower score
    return 70; // Placeholder - would need actual location comparison logic
  }

  private calculateSalaryMatch(person: Person, vacancy: Vacancy): number {
    // If no salary range specified, return perfect match
    if (!vacancy.salary_min && !vacancy.salary_max) {
      return 100;
    }

    // Simplified salary match - would need person's salary expectations
    // For now, assume salary is acceptable
    return 80; // Placeholder - would need person's salary expectations
  }
}
