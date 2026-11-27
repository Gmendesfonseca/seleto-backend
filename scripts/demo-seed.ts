// Seeds a running Seleto API with a demo company, a vacancy with competence requirements and
// candidates who apply to it, so the matching ranking has data. Uses only public endpoints.
//   DEMO_PASSWORD=... API_URL=http://127.0.0.1:3000/api/v1 npm run demo:seed

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3000/api/v1';
const PASSWORD = process.env.DEMO_PASSWORD;

type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type Priority = 'required' | 'preferred' | 'nice_to_have';

interface Candidate {
  name: string;
  slug: string;
  cpf: string;
  skills: Array<[competence: string, level: Level, years: number]>;
}

const COMPETENCES = ['TypeScript', 'NestJS', 'PostgreSQL', 'Docker', 'React', 'Communication'];

const REQUIREMENTS: Array<
  [competence: string, priority: Priority, minYears: number, weight: number]
> = [
  ['TypeScript', 'required', 3, 30],
  ['NestJS', 'required', 2, 30],
  ['PostgreSQL', 'preferred', 2, 20],
  ['Docker', 'nice_to_have', 1, 10],
  ['Communication', 'preferred', 0, 10],
];

const CANDIDATES: Candidate[] = [
  {
    name: 'Ana Ribeiro',
    slug: 'ana',
    cpf: '52998224725',
    skills: [
      ['TypeScript', 'expert', 6],
      ['NestJS', 'advanced', 4],
      ['PostgreSQL', 'advanced', 5],
      ['Docker', 'intermediate', 3],
      ['Communication', 'advanced', 6],
    ],
  },
  {
    name: 'Bruno Costa',
    slug: 'bruno',
    cpf: '16899535009',
    skills: [
      ['TypeScript', 'advanced', 4],
      ['NestJS', 'intermediate', 2],
      ['PostgreSQL', 'intermediate', 2],
    ],
  },
  {
    name: 'Carla Mendes',
    slug: 'carla',
    cpf: '74682489070',
    skills: [
      ['TypeScript', 'intermediate', 2],
      ['React', 'expert', 5],
      ['Communication', 'expert', 7],
    ],
  },
  {
    name: 'Diego Alves',
    slug: 'diego',
    cpf: '39053344705',
    skills: [
      ['TypeScript', 'advanced', 5],
      ['NestJS', 'advanced', 3],
      ['Docker', 'advanced', 4],
    ],
  },
  {
    name: 'Elisa Prado',
    slug: 'elisa',
    cpf: '11144477735',
    skills: [
      ['React', 'advanced', 3],
      ['Docker', 'beginner', 1],
    ],
  },
];

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    route: string,
  ) {
    super(`${route} answered ${status}: ${JSON.stringify(body)}`);
  }
}

async function api<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : undefined;
  if (!response.ok) throw new ApiError(response.status, payload, `${method} ${path}`);
  return payload as T;
}

async function ignoreConflict<T>(request: Promise<T>): Promise<T | undefined> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return undefined;
    throw error;
  }
}

function claims(token: string): { companyId?: string; profileId: string } {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
}

async function account(signup: Record<string, string>): Promise<string> {
  await ignoreConflict(api('POST', '/auth/signup', { ...signup, password: PASSWORD }));
  const { accessToken } = await api<{ accessToken: string }>('POST', '/auth/signin', {
    email: signup.email,
    password: PASSWORD,
  });
  return accessToken;
}

async function competenceIds(token: string): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const name of COMPETENCES) {
    const created = await ignoreConflict(
      api<{ id: string }>('POST', '/competences', { name }, token),
    );
    const found =
      created ??
      (
        await api<Array<{ id: string; name: string }>>(
          'GET',
          `/competences?name=${encodeURIComponent(name)}`,
          undefined,
          token,
        )
      ).find((competence) => competence.name.toLowerCase() === name.toLowerCase());
    if (!found) throw new Error(`Competence ${name} could not be created or found`);
    ids.set(name, found.id);
  }
  return ids;
}

async function main(): Promise<void> {
  if (!PASSWORD) throw new Error('Set DEMO_PASSWORD for the demo accounts');

  const companyToken = await account({
    username: 'acme-demo',
    name: 'Acme Tech',
    email: 'talent@acme.example.com',
    type: 'COMPANY',
    cnpj: '27865757000102',
    phone: '+5511900000000',
  });
  const { companyId } = claims(companyToken);
  const competences = await competenceIds(companyToken);

  const today = new Date();
  const inDays = (days: number) =>
    new Date(today.getTime() + days * 86_400_000).toISOString().slice(0, 10);
  const vacancy = await api<{ id: string }>(
    'POST',
    '/vacancies',
    {
      title: 'Senior Backend Engineer',
      description: 'Build and run the NestJS APIs behind our recruitment platform.',
      companyId,
      location: 'São Paulo (remote)',
      salaryMin: 14000,
      salaryMax: 19000,
      currency: 'BRL',
      type: 'full_time',
      area: 'Engineering',
      workMode: 'remote',
      contract: 'clt',
      level: 'senior',
      benefits: [],
      steps: [],
      requirements: [],
      responsibilities: [],
      publicationDate: inDays(0),
      expirationDate: inDays(30),
    },
    companyToken,
  );
  await api(
    'PUT',
    `/vacancies/${vacancy.id}/competence-requirements`,
    {
      requirements: REQUIREMENTS.map(([name, priority, minimumYearsExperience, weight]) => ({
        competenceId: competences.get(name),
        priority,
        minimumYearsExperience,
        weight,
      })),
    },
    companyToken,
  );

  for (const candidate of CANDIDATES) {
    const token = await account({
      username: `${candidate.slug}-demo`,
      name: candidate.name,
      email: `${candidate.slug}@candidates.example.com`,
      type: 'PERSON',
      cpf: candidate.cpf,
      phone: '+5511911111111',
    });
    const { profileId } = claims(token);
    for (const [name, level, yearsOfExperience] of candidate.skills) {
      await ignoreConflict(
        api(
          'POST',
          `/persons/${profileId}/competences`,
          { competenceId: competences.get(name), level, yearsOfExperience },
          token,
        ),
      );
    }
    await api('POST', '/applications', { applicantId: profileId, vacancyId: vacancy.id }, token);
  }

  const ranking = await api<Array<{ personId: string; matchScore: number | string }>>(
    'GET',
    `/vacancies/${vacancy.id}/best-candidates`,
    undefined,
    companyToken,
  );
  console.log(`Vacancy ${vacancy.id} — ${ranking.length} ranked candidates`);
  for (const match of ranking)
    console.log(`  ${Number(match.matchScore).toFixed(2)}  ${match.personId}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
