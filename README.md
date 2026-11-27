# Seleto — Backend

Recruitment and selection platform (ATS) API. Companies open vacancies, define the hiring process as configurable steps, and rank applicants with a weighted candidate–vacancy match score.

> 🇧🇷 **Resumo:** Seleto é o meu Trabalho de Graduação (TG, 2025): uma plataforma de recrutamento e seleção. Este repositório é o backend (NestJS). O frontend, feito com [Jonas Moura](https://github.com/jonasmouradev), está em [seleto-frontend](https://github.com/Gmendesfonseca/seleto-frontend). O projeto agora é a base de uma plataforma que evolui: cada migração (monólito → serviços, versões, bancos, nuvem) fica registrada abaixo, com ADR e métricas de antes e depois.

## What it does

- **Vacancies and hiring steps.** Recruiters define a vacancy, its requirements, benefits and responsible people, and build the process from reusable steps and vacancy templates.
- **Applications funnel.** Candidates apply; recruiters move them through the vacancy's steps.
- **Candidate–vacancy matching.** A weighted score ranks applicants: competences 40%, experience 25%, education 15%, location 10%, salary 10%. Competence requirements carry a priority (required vs. desired), and proficiency levels map to points.
- **Multi-company access control.** Users, companies, roles and permissions (RBAC), with JWT access tokens, refresh tokens and password reset.
- **Dashboard** with recruitment indicators.
- **i18n** in Portuguese and English.

## Architecture

A modular NestJS monolith. Each business area under `src/domain/` (vacancies, steps, applications, matching, competences, companies, users, auth, roles, permissions, …) owns its controller, service, DTOs and repositories behind interfaces, so persistence can be swapped without touching business rules.

| Concern | Choice |
|---|---|
| Runtime | Node.js, NestJS 11 (SWC builder) |
| Relational data | PostgreSQL 15 via Sequelize, versioned migrations in `migrations/` |
| Cache / queue | Redis 7; Bull module wired but no queue consumers yet |
| Protection | Global rate limiting (Nest throttler guard), guard-based authorization |
| Ops | Health check module, Docker Compose for local stack |

## Running locally

```bash
docker compose up -d      # postgres:5432, redis:6379, mongo:27017, api:5000
cp .env.example .env      # fill in local values
npm ci
npm run migrate
npm run start:dev
```

Tests:

```bash
npm test                  # unit
npm run test:e2e          # end-to-end (auth, users, companies, applications)
```

## Known gaps (starting point)

This is the honest v1 baseline the evolution log starts from:

- No OpenAPI/Swagger contract.
- No CI pipeline.
- MongoDB is provisioned in `compose.yaml` but not used by the code yet.
- The Bull queue module is configured, but no queue is registered or consumed yet.
- Test coverage is uneven: 9 unit spec files, 25 end-to-end spec files.

## Evolution log

| Date | Change | Why | Before → after |
|---|---|---|---|
| 2025 | v1: modular monolith delivered as graduation project | — | baseline |

Planned direction: [`docs/MICROSERVICES_ROADMAP.md`](docs/MICROSERVICES_ROADMAP.md).

## Credits

Backend by Gabriel Mendes Fonseca, with contributions from Jonas Moura. Frontend by Jonas Moura and Gabriel Mendes Fonseca.
