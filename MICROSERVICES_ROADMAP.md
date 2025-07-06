# Microservices Migration Roadmap

> **Project**: TG-Backend  
> **Current Architecture**: NestJS Monolith  
> **Target Architecture**: Microservices  
> **Last Updated**: July 5, 2025

## 📊 Current State Assessment

### ✅ What's Already Done Well

#### 1. **Domain-Driven Design Structure**

- [x] Clear domain boundaries (`users`, `auth`, `secret`, `mailers`)
- [x] Proper module separation with dedicated folders
- [x] Each domain has its own controllers, services, and repositories

#### 2. **Interface-Based Architecture**

- [x] Abstract service interfaces (`UsersServiceInterface`, `SecretServiceInterface`)
- [x] Repository pattern with interfaces (`UsersRepositoryInterface`)
- [x] Dependency injection using abstract classes
- [x] Easy to swap implementations

#### 3. **Infrastructure Separation**

- [x] Centralized configuration management (`ConfigModule`)
- [x] Modular infrastructure components:
  - [x] Database module
  - [x] Queue module (Bull/Redis)
  - [x] I18n module
  - [x] Health check module
  - [x] Rate limiting module

#### 4. **Security & Authorization**

- [x] JWT-based authentication
- [x] Guard-based authorization system
- [x] Permission-based access control
- [x] Proper request/response interfaces

#### 5. **Development Best Practices**

- [x] TypeScript with strict configuration
- [x] ESLint and Prettier setup
- [x] Husky git hooks
- [x] Conventional commits with Gitmoji
- [x] Jest testing setup
- [x] Docker configuration

#### 6. **Microservice-Ready Patterns**

- [x] Guards already using `ClientProxy` pattern
- [x] Message-based communication structure in guards
- [x] Environment-based configuration
- [x] Health monitoring setup

---

## ⚠️ Areas Needing Attention

### 1. **Cross-Domain Dependencies**

- [ ] `UsersService` directly depends on `SecretServiceInterface`
- [ ] `UsersService` directly depends on `MailerService`
- [ ] Tight coupling between domains needs to be resolved

### 2. **Shared Database**

- [ ] All domains share single PostgreSQL database
- [ ] No data isolation between domains
- [ ] Database schema needs to be split

### 3. **Monolithic Communication**

- [ ] Direct method calls between services
- [ ] No event-driven architecture
- [ ] No service discovery mechanism

---

## 🎯 Migration Strategy

### **Phase 1: Foundation Setup (Weeks 1-2)**

#### 1.1 Create Shared Libraries

- [ ] Extract common interfaces to shared package

  ```typescript
  // @tg/shared-types
  - JWT interfaces
  - Pagination types
  - Error response formats
  - Event contracts
  ```

- [ ] Create shared utilities package
  ```typescript
  // @tg/shared-utils
  - Common decorators (@Secured, @Permission)
  - Validation pipes
  - Exception filters
  - Logger configuration
  ```

#### 1.2 Event-Driven Architecture Setup

- [ ] Implement event bus (CQRS/EventEmitter2)
- [ ] Define domain events:

  ```typescript
  // User Domain Events
  -UserCreatedEvent -
    UserActivatedEvent -
    UserEmailChangeRequestedEvent -
    // Secret Domain Events
    SecretCreatedEvent -
    SecretValidatedEvent -
    SecretExpiredEvent;
  ```

### **Phase 2: Service Extraction (Weeks 3-6)**

#### 2.1 Secret Service (Most Independent)

- [ ] Extract to separate NestJS application
- [ ] Create dedicated database schema
- [ ] Implement message broker communication
- [ ] Setup service discovery
- [ ] Add health checks and monitoring

**New Structure:**

```
secret-service/
├── src/
│   ├── domain/
│   │   └── secret/
│   ├── infrastructure/
│   └── application/
├── Dockerfile
└── docker-compose.yml
```

#### 2.2 Notification Service

- [ ] Extract mailer functionality
- [ ] Setup email template management
- [ ] Implement delivery tracking
- [ ] Add retry mechanisms

#### 2.3 Auth Service

- [ ] Extract JWT token management
- [ ] Implement token validation endpoints
- [ ] Setup refresh token logic
- [ ] Add session management

#### 2.4 User Service

- [ ] Extract user management functionality
- [ ] Remove direct dependencies on other services
- [ ] Implement event publishing for user actions
- [ ] Setup user data isolation

### **Phase 3: Communication Layer (Weeks 7-8)**

#### 3.1 Message Broker Setup

- [ ] Configure Redis/RabbitMQ for inter-service communication
- [ ] Implement message patterns:

  ```typescript
  // Request-Response Pattern
  userService.send('user.findById', { id });

  // Event Pattern
  eventBus.publish('user.created', userData);
  ```

#### 3.2 API Gateway

- [ ] Setup API Gateway (NestJS Gateway or Kong/Envoy)
- [ ] Implement request routing
- [ ] Add rate limiting
- [ ] Setup load balancing

#### 3.3 Service Discovery

- [ ] Implement service registry (Consul/Eureka)
- [ ] Add health check integration
- [ ] Setup automatic failover

### **Phase 4: Data Separation (Weeks 9-10)**

#### 4.1 Database Per Service

```sql
-- user-service-db
Users table
UserProfiles table
UserSessions table

-- secret-service-db
Secrets table
SecretTypes table

-- notification-service-db
EmailTemplates table
DeliveryLogs table
```

#### 4.2 Data Migration Strategy

- [ ] Create migration scripts
- [ ] Implement data synchronization
- [ ] Setup backup strategies
- [ ] Plan rollback procedures

---

## 🏗️ Target Architecture

### **Service Boundaries**

#### 1. **User Service** 👥

- **Responsibilities**: User CRUD, Profile management, User authentication
- **Database**: PostgreSQL (user data)
- **Events Published**: `UserCreated`, `UserUpdated`, `UserDeleted`
- **Events Consumed**: `EmailVerified`, `PasswordReset`

#### 2. **Auth Service** 🔐

- **Responsibilities**: JWT management, Token validation, Session management
- **Database**: Redis (sessions, tokens)
- **Events Published**: `TokenGenerated`, `SessionExpired`
- **Events Consumed**: `UserCreated`, `UserDeactivated`

#### 3. **Secret Service** 🔑

- **Responsibilities**: Secret generation, Validation, Expiration management
- **Database**: PostgreSQL (secrets)
- **Events Published**: `SecretCreated`, `SecretValidated`, `SecretExpired`
- **Events Consumed**: `UserEmailChangeRequested`

#### 4. **Notification Service** 📧

- **Responsibilities**: Email sending, Template management, Delivery tracking
- **Database**: PostgreSQL (templates, logs)
- **Events Published**: `EmailSent`, `EmailFailed`
- **Events Consumed**: `UserCreated`, `PasswordResetRequested`

#### 5. **API Gateway** 🌐

- **Responsibilities**: Request routing, Authentication, Rate limiting
- **Features**: Load balancing, Circuit breaker, Request/Response transformation

---

## 📁 Folder Structure Analysis

### **Current Monolith Structure**

```
TG-Backend-V1/
├── src/
│   ├── app.module.ts                    # Main application module
│   ├── main.ts                          # Application bootstrap
│   │
│   ├── application/                     # Application layer (currently minimal)
│   │   ├── controllers/                 # Shared controllers
│   │   └── dtos/                        # Data transfer objects
│   │
│   ├── domain/                          # Business logic domains
│   │   ├── auth/                        # Authentication domain
│   │   │   ├── auth.module.ts
│   │   │   └── guard/
│   │   │       ├── auth.guard.ts
│   │   │       └── auth.guard.spec.ts
│   │   │
│   │   ├── users/                       # User management domain
│   │   │   ├── user.model.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── index.ts
│   │   │   │   ├── user.interface.ts
│   │   │   │   ├── user.repository.interface.ts
│   │   │   │   └── user.service.interface.ts
│   │   │   └── repositories/
│   │   │       └── user.sequelize.repository.ts
│   │   │
│   │   ├── secret/                      # Secret management domain
│   │   │   ├── secret.model.ts
│   │   │   ├── secret.module.ts
│   │   │   ├── secret.service.ts
│   │   │   ├── secret.service.spec.ts
│   │   │   └── interface/
│   │   │       ├── secret.interface.ts
│   │   │       └── secret.service.interface.ts
│   │   │
│   │   └── mailers/                     # Email/notification domain
│   │       ├── mailer.module.ts
│   │       ├── adapters/
│   │       │   └── twing.adapter.ts
│   │       └── templates/
│   │           ├── change-email.twig
│   │           ├── index.twig
│   │           ├── passwor-reset.twig
│   │           └── welcome.twig
│   │
│   ├── infrastructure/                  # Infrastructure layer
│   │   ├── config/                      # Configuration modules
│   │   │   ├── config.module.ts
│   │   │   ├── database.module.ts
│   │   │   ├── i18n.module.ts
│   │   │   ├── limit.module.ts
│   │   │   ├── queue.module.ts
│   │   │   └── redis.module.ts
│   │   │
│   │   └── health/                      # Health check infrastructure
│   │       ├── health.controller.ts
│   │       ├── health.controller.spec.ts
│   │       ├── health.module.ts
│   │       └── redis-health.indicator.ts
│   │
│   └── shared/                          # Shared utilities and cross-cutting concerns
│       ├── decorators/
│       │   ├── authorization.decorator.ts
│       │   └── permission.decorator.ts
│       ├── guards/
│       │   ├── auth.guard.ts
│       │   ├── auth.guard.spec.ts
│       │   ├── authorization.guard.ts
│       │   └── permission.guard.ts
│       ├── i18n/
│       │   ├── en-US/
│       │   └── pt-BR/
│       ├── interfaces/
│       │   ├── jwt.interface.ts
│       │   ├── page.interface.ts
│       │   └── request.d.ts
│       ├── middleware/
│       │   ├── http/
│       │   │   └── jwtI18nResolver.ts
│       │   └── pagination/
│       │       └── pagination.middleware.ts
│       └── utils/
│           ├── constants.ts
│           ├── type.ts
│           └── users.ts
│
├── test/                                # Test files
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── compose.local.yaml                   # Docker compose for local development
├── Dockerfile.local                     # Local development Dockerfile
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
└── nest-cli.json                        # NestJS CLI configuration
```

---

### **Future Microservices Structure**

#### **1. User Service** 👥

```
user-service/
├── src/
│   ├── main.ts                          # Service bootstrap
│   ├── app.module.ts                    # Main module
│   │
│   ├── application/                     # Application layer
│   │   ├── controllers/
│   │   │   ├── user.controller.ts
│   │   │   └── profile.controller.ts
│   │   ├── dtos/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── update-profile.dto.ts
│   │   └── events/
│   │       ├── handlers/
│   │       │   ├── user-created.handler.ts
│   │       │   └── email-verified.handler.ts
│   │       └── publishers/
│   │           └── user-event.publisher.ts
│   │
│   ├── domain/                          # Business logic
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── user-profile.entity.ts
│   │   ├── interfaces/
│   │   │   ├── user.interface.ts
│   │   │   ├── user.service.interface.ts
│   │   │   └── user.repository.interface.ts
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   └── profile.service.ts
│   │   └── events/
│   │       ├── user-created.event.ts
│   │       ├── user-updated.event.ts
│   │       └── user-deactivated.event.ts
│   │
│   ├── infrastructure/                  # Infrastructure layer
│   │   ├── database/
│   │   │   ├── repositories/
│   │   │   │   ├── user.repository.ts
│   │   │   │   └── profile.repository.ts
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── messaging/
│   │   │   ├── message-broker.module.ts
│   │   │   └── event-handlers/
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   └── app.config.ts
│   │   └── health/
│   │       ├── health.controller.ts
│   │       └── health.module.ts
│   │
│   └── shared/                          # Service-specific shared code
│       ├── guards/
│       ├── interceptors/
│       ├── pipes/
│       └── utils/
│
├── test/                                # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
│
├── k8s/                                 # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
│
├── package.json
├── tsconfig.json
└── nest-cli.json
```

#### **2. Auth Service** 🔐

```
auth-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── application/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── token.controller.ts
│   │   ├── dtos/
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── validate-token.dto.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── refresh-token.guard.ts
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── session.entity.ts
│   │   │   └── refresh-token.entity.ts
│   │   ├── interfaces/
│   │   │   ├── auth.service.interface.ts
│   │   │   ├── token.service.interface.ts
│   │   │   └── session.repository.interface.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── token.service.ts
│   │   │   └── session.service.ts
│   │   └── events/
│   │       ├── user-authenticated.event.ts
│   │       ├── token-generated.event.ts
│   │       └── session-expired.event.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── repositories/
│   │   │       ├── session.repository.ts
│   │   │       └── refresh-token.repository.ts
│   │   ├── cache/                       # Redis for sessions/tokens
│   │   │   ├── redis.module.ts
│   │   │   └── cache.service.ts
│   │   ├── messaging/
│   │   │   └── auth-event.publisher.ts
│   │   └── config/
│   │       ├── jwt.config.ts
│   │       └── redis.config.ts
│   │
│   └── shared/
│       ├── constants/
│       ├── types/
│       └── utils/
│
├── test/
├── docker/
├── k8s/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

#### **3. Secret Service** 🔑

```
secret-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── application/
│   │   ├── controllers/
│   │   │   └── secret.controller.ts
│   │   ├── dtos/
│   │   │   ├── create-secret.dto.ts
│   │   │   └── validate-secret.dto.ts
│   │   └── events/
│   │       └── handlers/
│   │           ├── email-change-requested.handler.ts
│   │           └── password-reset-requested.handler.ts
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   └── secret.entity.ts
│   │   ├── interfaces/
│   │   │   ├── secret.service.interface.ts
│   │   │   └── secret.repository.interface.ts
│   │   ├── services/
│   │   │   ├── secret.service.ts
│   │   │   └── secret-generator.service.ts
│   │   ├── events/
│   │   │   ├── secret-created.event.ts
│   │   │   ├── secret-validated.event.ts
│   │   │   └── secret-expired.event.ts
│   │   └── enums/
│   │       └── secret-type.enum.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── repositories/
│   │   │   │   └── secret.repository.ts
│   │   │   └── migrations/
│   │   ├── messaging/
│   │   │   └── secret-event.publisher.ts
│   │   ├── scheduler/                   # For secret expiration
│   │   │   ├── scheduler.module.ts
│   │   │   └── secret-cleanup.job.ts
│   │   └── config/
│   │       └── database.config.ts
│   │
│   └── shared/
│       ├── constants/
│       └── utils/
│           └── crypto.utils.ts
│
├── test/
├── docker/
├── k8s/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

#### **4. Notification Service** 📧

```
notification-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── application/
│   │   ├── controllers/
│   │   │   ├── email.controller.ts
│   │   │   └── template.controller.ts
│   │   ├── dtos/
│   │   │   ├── send-email.dto.ts
│   │   │   └── create-template.dto.ts
│   │   └── events/
│   │       └── handlers/
│   │           ├── user-created.handler.ts
│   │           ├── password-reset.handler.ts
│   │           └── email-verification.handler.ts
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── email-template.entity.ts
│   │   │   └── delivery-log.entity.ts
│   │   ├── interfaces/
│   │   │   ├── email.service.interface.ts
│   │   │   ├── template.service.interface.ts
│   │   │   └── notification.repository.interface.ts
│   │   ├── services/
│   │   │   ├── email.service.ts
│   │   │   ├── template.service.ts
│   │   │   └── delivery-tracking.service.ts
│   │   ├── events/
│   │   │   ├── email-sent.event.ts
│   │   │   ├── email-failed.event.ts
│   │   │   └── email-delivered.event.ts
│   │   └── enums/
│   │       ├── email-status.enum.ts
│   │       └── template-type.enum.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── repositories/
│   │   │   │   ├── template.repository.ts
│   │   │   │   └── delivery-log.repository.ts
│   │   │   └── migrations/
│   │   ├── email/
│   │   │   ├── providers/
│   │   │   │   ├── smtp.provider.ts
│   │   │   │   └── ses.provider.ts
│   │   │   └── adapters/
│   │   │       └── twing.adapter.ts
│   │   ├── messaging/
│   │   │   └── notification-event.publisher.ts
│   │   ├── queue/                       # Bull/Redis for email queue
│   │   │   ├── email-queue.module.ts
│   │   │   └── email-queue.processor.ts
│   │   └── config/
│   │       ├── email.config.ts
│   │       └── queue.config.ts
│   │
│   └── shared/
│       ├── templates/                   # Email templates
│       │   ├── welcome.twig
│       │   ├── password-reset.twig
│       │   └── email-verification.twig
│       └── utils/
│           └── template.utils.ts
│
├── test/
├── docker/
├── k8s/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 📋 Implementation Checklist

### **Infrastructure Requirements**

- [ ] Docker containers for each service
- [ ] Kubernetes/Docker Compose orchestration
- [ ] Message broker (Redis/RabbitMQ)
- [ ] Service discovery mechanism
- [ ] Centralized logging (ELK stack)
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Distributed tracing (Jaeger)

### **Development Requirements**

- [ ] Shared libraries npm packages
- [ ] Service templates/scaffolding
- [ ] Integration testing strategy
- [ ] Contract testing (Pact)
- [ ] End-to-end testing
- [ ] Performance testing

### **DevOps Requirements**

- [ ] CI/CD pipelines per service
- [ ] Database migration strategies
- [ ] Secret management (Vault)
- [ ] Environment configuration
- [ ] Backup and disaster recovery
- [ ] Security scanning

---

## 🚦 Migration Risks & Mitigation

### **High Risk** 🔴

1. **Data Consistency**: Moving from ACID transactions to eventual consistency
   - **Mitigation**: Implement saga pattern, event sourcing
2. **Service Dependencies**: Breaking circular dependencies
   - **Mitigation**: Careful event modeling, async communication

### **Medium Risk** 🟡

1. **Performance**: Network latency between services
   - **Mitigation**: Caching strategies, service colocation
2. **Debugging**: Distributed tracing complexity
   - **Mitigation**: Proper logging, correlation IDs

### **Low Risk** 🟢

1. **Code Duplication**: Shared logic across services
   - **Mitigation**: Shared libraries, common patterns

---

## 📈 Success Metrics

### **Technical Metrics**

- [ ] Service independence (deployability)
- [ ] Response time < 200ms for 95% of requests
- [ ] 99.9% uptime per service
- [ ] Database query performance maintained
- [ ] Memory usage < 512MB per service

### **Development Metrics**

- [ ] Deployment frequency increased by 50%
- [ ] Mean time to recovery < 15 minutes
- [ ] Developer onboarding time reduced
- [ ] Code coverage > 80% per service

---

## 🔄 Rollback Strategy

### **Phase Rollback Plans**

1. **Service Extraction**: Keep monolith running in parallel
2. **Database Split**: Maintain data sync during transition
3. **Communication**: Feature flags for service communication
4. **Complete Migration**: Blue-green deployment strategy

---

## 📚 Additional Resources

### **Documentation**

- [ ] Service API documentation (OpenAPI/Swagger)
- [ ] Event schemas documentation
- [ ] Deployment guides
- [ ] Troubleshooting runbooks

### **Training**

- [ ] Team training on microservices patterns
- [ ] Docker/Kubernetes workshops
- [ ] Event-driven architecture principles
- [ ] Distributed systems debugging

---

**Next Steps**: Start with Phase 1 - Foundation Setup and focus on creating shared libraries and implementing event-driven patterns within the existing monolith.
