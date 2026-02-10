# Web Application Template - Product Requirements Document

**Version:** 1.0  
**Date:** 2026-02-10  
**Author:** ScrewMolt  
**Status:** Draft  
**Purpose:** Cookie-cutter template for future web applications

---

## 1. Executive Summary

The Web Application Template is a production-ready, full-stack boilerplate designed to accelerate development of new web projects. It provides a solid foundation with authentication, user management, database integration, and deployment infrastructure - all following industry best practices.

**Key Benefits:**
- **Rapid startup**: New projects launch in minutes, not hours
- **Battle-tested**: Production-ready patterns and security
- **Developer-friendly**: Hot reload, TypeScript, modern tooling
- **Scalable**: Microservices-ready architecture
- **Maintainable**: Clean code, clear structure, comprehensive docs

---

## 2. Problem Statement

Starting new web projects involves repetitive boilerplate work:
- Setting up authentication and user management
- Configuring databases and ORMs
- Implementing security best practices
- Writing Docker configurations
- Setting up dev/prod environments
- Implementing logging and error handling
- Creating consistent API patterns

**Current Pain Points:**
- 2-3 days wasted on boilerplate for each new project
- Inconsistent patterns across projects
- Security issues from rushed setup
- Missing production concerns (logging, monitoring, error handling)

---

## 3. Goals & Objectives

### Primary Goals
1. **Zero to Deploy in 5 Minutes**: Clone, configure, deploy
2. **Production-Ready**: Security, logging, error handling out of the box
3. **Developer Experience**: Hot reload, TypeScript, clear structure
4. **Extensible**: Easy to add features without refactoring
5. **Well-Documented**: Clear README, architecture docs, code comments

### Success Metrics
- New project setup time: < 5 minutes
- Code coverage: > 80%
- Security score (Snyk/npm audit): 0 vulnerabilities
- Docker build time: < 2 minutes
- Hot reload time: < 2 seconds

---

## 4. Target Users

| User Type | Description | Primary Needs |
|-----------|-------------|---------------|
| **Solo Developer** | Building side projects/startups | Quick setup, good defaults |
| **Development Team** | Building client projects | Consistent patterns, collaboration |
| **You (Screwgoth)** | Starting new projects | Proven architecture, time savings |

---

## 5. Features & Requirements

### 5.1 Core Features (MVP)

#### F1: Authentication & Authorization
- **User Registration**
  - Email + password
  - Password strength validation (min 8 chars, uppercase, lowercase, number)
  - Email verification (optional flag)
  - Rate limiting on registration endpoint
- **User Login**
  - Email + password
  - JWT token generation (access + refresh tokens)
  - Remember me functionality
  - Login attempt tracking (lock after 5 failed attempts)
- **Password Management**
  - Forgot password flow
  - Password reset via email token
  - Change password (authenticated users)
- **Session Management**
  - JWT with 15-min access token, 7-day refresh token
  - Token refresh endpoint
  - Logout (token invalidation)
  - "Remember me" extends refresh token to 30 days
- **Authorization**
  - Role-based access control (RBAC)
  - Default roles: Admin, User, Guest
  - Route-level protection (middleware)
  - Resource-level permissions

#### F2: User Management
- **User Profile**
  - View profile (name, email, created date, role)
  - Update profile (name, avatar)
  - Delete account (soft delete with grace period)
- **Admin User Management** (Admin role only)
  - List all users (paginated, searchable)
  - View user details
  - Update user roles
  - Suspend/activate users
  - Delete users (soft delete)

#### F3: Database Layer
- **PostgreSQL Integration**
  - Connection pooling (pg-pool)
  - Query builder or ORM (Prisma recommended)
  - Migration system (version-controlled schema)
  - Seeding scripts (dev/test data)
- **Schema Design**
  - Users table (id, email, password_hash, name, avatar, role, status, created_at, updated_at)
  - Sessions table (id, user_id, token, expires_at)
  - Audit log table (id, user_id, action, resource, timestamp, ip_address)
- **Best Practices**
  - UUID primary keys
  - Soft deletes (deleted_at column)
  - Created/updated timestamps
  - Database indexes on frequently queried fields

#### F4: API Design
- **RESTful Conventions**
  - Resource-based URLs (`/api/users`, `/api/auth/login`)
  - HTTP methods (GET, POST, PUT, PATCH, DELETE)
  - Consistent response format:
    ```json
    {
      "success": true,
      "data": { ... },
      "message": "Operation successful",
      "meta": { "page": 1, "limit": 20, "total": 100 }
    }
    ```
- **Error Handling**
  - Standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)
  - Consistent error format:
    ```json
    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input",
        "details": [
          { "field": "email", "message": "Invalid email format" }
        ]
      }
    }
    ```
- **Validation**
  - Request validation middleware (Joi or Zod)
  - Input sanitization (prevent XSS, SQL injection)
  - File upload validation (size, type)
- **Pagination**
  - Query params: `?page=1&limit=20&sort=created_at&order=desc`
  - Response includes total count and pagination metadata

#### F5: Frontend Application
- **React 18 + TypeScript**
  - Vite for fast dev server and builds
  - TypeScript for type safety
  - ESLint + Prettier for code quality
- **Routing**
  - React Router v6
  - Protected routes (redirect to login)
  - Lazy loading for code splitting
- **State Management**
  - React Context for auth state
  - TanStack Query (React Query) for server state
  - Local state with hooks (useState, useReducer)
- **UI Framework**
  - Tailwind CSS for styling
  - shadcn/ui for components (optional but recommended)
  - Responsive design (mobile-first)
- **Key Pages**
  - Landing/Home page
  - Login page
  - Register page
  - Forgot password page
  - Dashboard (authenticated users)
  - Profile page
  - Admin panel (admin users only)
  - 404 Not Found page

#### F6: Security
- **Backend Security**
  - Password hashing (bcrypt, 10 rounds)
  - JWT signing with secret key (configurable via env)
  - CORS configuration (whitelist origins)
  - Helmet.js for HTTP headers
  - Rate limiting (express-rate-limit)
  - SQL injection prevention (parameterized queries)
  - XSS prevention (input sanitization)
- **Frontend Security**
  - HttpOnly cookies for refresh tokens (optional)
  - XSS prevention (React's built-in escaping)
  - CSRF protection (tokens for state-changing operations)
  - Content Security Policy headers
- **Environment Security**
  - Secrets in .env files (never committed)
  - Different configs for dev/staging/prod
  - Secret rotation mechanism

#### F7: Logging & Monitoring
- **Backend Logging**
  - Winston or Pino for structured logging
  - Log levels: error, warn, info, debug
  - Log to console (dev) and files (prod)
  - Request logging (method, path, status, duration)
  - Error logging with stack traces
- **Error Tracking**
  - Global error handler middleware
  - Uncaught exception handler
  - Promise rejection handler
  - Error categorization (validation, auth, system)
- **Audit Logging**
  - Log sensitive operations (login, password change, role change)
  - IP address and user agent tracking
  - Timestamp and user ID

#### F8: Docker Deployment
- **Multi-Container Setup**
  - Frontend container (nginx serving static React build)
  - Backend container (Node.js + Express)
  - PostgreSQL container (with persistent volume)
  - Nginx reverse proxy (optional, for SSL termination)
- **Docker Compose**
  - Development compose file (with hot reload)
  - Production compose file (optimized builds)
  - Health checks for all services
  - Automatic restart policies
  - Environment variable management
- **Dockerfile Best Practices**
  - Multi-stage builds (reduce image size)
  - Non-root user
  - Layer caching optimization
  - .dockerignore for faster builds
- **Networking**
  - Internal network for backend ↔ database
  - Public network for frontend ↔ users
  - Reverse proxy for API requests

#### F9: Development Experience
- **Hot Reload**
  - Frontend: Vite HMR (< 2 seconds)
  - Backend: nodemon or tsx watch mode
  - Database: Volume mounting for persistence
- **Scripts**
  - `npm run dev` - Start all services
  - `npm run build` - Production build
  - `npm run test` - Run tests
  - `npm run lint` - Linting
  - `npm run migrate` - Database migrations
  - `npm run seed` - Seed database
- **Code Quality**
  - ESLint + TypeScript strict mode
  - Prettier for consistent formatting
  - Husky for pre-commit hooks
  - lint-staged for incremental linting

#### F10: Documentation
- **README.md**
  - Quick start guide (5-minute setup)
  - Architecture overview
  - Tech stack explanation
  - Environment variables reference
  - API endpoint documentation
  - Docker commands
  - Troubleshooting section
- **Code Documentation**
  - JSDoc comments for functions
  - Inline comments for complex logic
  - Type definitions (TypeScript)
- **Architecture Docs**
  - System architecture diagram
  - Database schema diagram
  - Authentication flow diagram
  - Deployment architecture

---

### 5.2 Optional Features (Post-MVP)

- **Email Service**
  - SendGrid/Mailgun integration
  - Email templates (welcome, reset password, etc.)
  - Email queue (background jobs)
- **File Upload**
  - S3/Cloudinary integration
  - Avatar upload
  - File validation and processing
- **Social Authentication**
  - Google OAuth
  - GitHub OAuth
  - Facebook login
- **Testing**
  - Backend: Jest + Supertest (API tests)
  - Frontend: Vitest + React Testing Library
  - E2E: Playwright or Cypress
- **CI/CD Pipeline**
  - GitHub Actions workflows
  - Automated testing
  - Docker image builds
  - Deployment to cloud (AWS/GCP/DigitalOcean)
- **Monitoring**
  - Health check endpoint (`/health`)
  - Metrics endpoint (Prometheus format)
  - Application performance monitoring (APM)
- **Admin Panel Features**
  - Analytics dashboard
  - System logs viewer
  - Database backup/restore UI

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 18.x |
| **Frontend Build** | Vite | 5.x |
| **Frontend Styling** | Tailwind CSS | 3.x |
| **Frontend Language** | TypeScript | 5.x |
| **Backend** | Node.js | 20.x LTS |
| **Backend Framework** | Express | 4.x |
| **Backend Language** | TypeScript | 5.x |
| **Database** | PostgreSQL | 16.x |
| **ORM** | Prisma | 5.x |
| **Authentication** | JWT | jsonwebtoken |
| **Password Hashing** | bcrypt | 5.x |
| **Validation** | Zod | 3.x |
| **Logging** | Winston | 3.x |
| **Containerization** | Docker | 24.x |
| **Orchestration** | Docker Compose | 2.x |

### 6.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│                    React + TypeScript + Vite                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│                    (Optional, for production)                │
│                    - SSL Termination                         │
│                    - Load Balancing                          │
│                    - Static File Serving                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────────┐
│    Frontend Container     │ │     Backend Container         │
│    (nginx:alpine)         │ │     (node:20-alpine)          │
│    - Serve React build    │ │     - Express REST API        │
│    - Port 80/443          │ │     - Authentication          │
│                           │ │     - Business Logic          │
│                           │ │     - Port 3000               │
└───────────────────────────┘ └───────────────────────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────────┐
                              │   PostgreSQL Container          │
                              │   (postgres:16-alpine)          │
                              │   - User data                   │
                              │   - Session data                │
                              │   - Audit logs                  │
                              │   - Port 5432                   │
                              │   - Persistent volume           │
                              └─────────────────────────────────┘
```

### 6.3 Folder Structure

```
webapp-template/
├── frontend/                       # React frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   │   ├── ui/               # UI primitives (shadcn/ui)
│   │   │   ├── layout/           # Layout components
│   │   │   └── features/         # Feature-specific components
│   │   ├── pages/                # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Admin.tsx
│   │   ├── lib/                  # Utilities
│   │   │   ├── api.ts           # API client
│   │   │   ├── auth.ts          # Auth helpers
│   │   │   └── utils.ts         # Generic utilities
│   │   ├── hooks/                # Custom React hooks
│   │   ├── contexts/             # React contexts
│   │   ├── types/                # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── backend/                        # Express backend
│   ├── src/
│   │   ├── routes/               # API routes
│   │   │   ├── auth.ts          # Auth endpoints
│   │   │   ├── users.ts         # User management
│   │   │   └── health.ts        # Health check
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts          # JWT verification
│   │   │   ├── validate.ts      # Request validation
│   │   │   ├── errorHandler.ts  # Global error handler
│   │   │   └── rateLimiter.ts   # Rate limiting
│   │   ├── services/             # Business logic
│   │   │   ├── authService.ts
│   │   │   └── userService.ts
│   │   ├── db/                   # Database
│   │   │   ├── prisma/          # Prisma schema & migrations
│   │   │   └── client.ts        # Prisma client instance
│   │   ├── utils/                # Utilities
│   │   │   ├── logger.ts        # Winston logger
│   │   │   ├── jwt.ts           # JWT helpers
│   │   │   └── crypto.ts        # Bcrypt helpers
│   │   ├── types/                # TypeScript types
│   │   └── index.ts              # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml              # Development compose
├── docker-compose.prod.yml         # Production compose
├── .env.example                    # Environment template
├── .gitignore
├── package.json                    # Root package.json (workspaces)
└── README.md                       # Documentation
```

### 6.4 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Sessions table (optional - for token blacklisting)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 7. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| POST | `/refresh` | Refresh access token | Yes (refresh token) |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| POST | `/change-password` | Change password | Yes |

### Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update current user profile | Yes |
| DELETE | `/me` | Delete current user account | Yes |
| GET | `/` | List all users (admin) | Yes (admin) |
| GET | `/:id` | Get user by ID (admin) | Yes (admin) |
| PUT | `/:id` | Update user (admin) | Yes (admin) |
| DELETE | `/:id` | Delete user (admin) | Yes (admin) |

### Health (`/api/health`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check | No |

---

## 8. Environment Variables

```bash
# Backend (.env)
NODE_ENV=development                # development | production | test
PORT=3000                          # Backend port
DATABASE_URL=postgresql://user:pass@db:5432/webapp
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m              # 15 minutes
JWT_REFRESH_EXPIRY=7d              # 7 days
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173  # Frontend URL
RATE_LIMIT_WINDOW=15m              # Rate limit window
RATE_LIMIT_MAX=100                 # Max requests per window

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
```

---

## 9. Development Workflow

### Initial Setup
```bash
# 1. Clone template
git clone <template-repo> my-new-project
cd my-new-project

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start Docker containers
docker compose up -d

# 5. Run migrations
npm run migrate

# 6. Seed database (optional)
npm run seed

# 7. Start development
npm run dev
```

### Daily Development
```bash
# Start all services (hot reload enabled)
npm run dev

# Run migrations after schema changes
npm run migrate

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production containers
docker compose -f docker-compose.prod.yml up -d
```

---

## 10. Testing Strategy

### Backend Tests
- **Unit Tests**: Service layer logic
- **Integration Tests**: API endpoints with test database
- **Security Tests**: Auth middleware, input validation
- **Target Coverage**: > 80%

### Frontend Tests
- **Unit Tests**: Utility functions, hooks
- **Component Tests**: UI components in isolation
- **Integration Tests**: User flows (login, registration)
- **E2E Tests** (optional): Full user journeys

---

## 11. Security Checklist

- [ ] Passwords hashed with bcrypt (10+ rounds)
- [ ] JWT secrets stored in environment variables
- [ ] CORS configured with whitelist
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] Helmet.js for security headers
- [ ] HTTPS in production
- [ ] Database credentials never in code
- [ ] No sensitive data in logs
- [ ] Failed login attempt tracking
- [ ] Account lockout after failed attempts

---

## 12. Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| Frontend Load Time | < 2s |
| Database Query Time (p95) | < 50ms |
| Docker Build Time | < 2 min |
| Hot Reload Time | < 2s |

---

## 13. Success Criteria

- [ ] Setup time < 5 minutes
- [ ] All API endpoints functional
- [ ] Authentication working (register, login, logout)
- [ ] Protected routes enforced
- [ ] Docker compose deployment working
- [ ] Database migrations working
- [ ] Hot reload working (frontend + backend)
- [ ] Code quality: 0 ESLint errors
- [ ] Security: 0 npm audit vulnerabilities
- [ ] Documentation complete (README + code comments)

---

## 14. Future Enhancements

**Phase 2:**
- Email verification
- Social OAuth (Google, GitHub)
- Two-factor authentication (2FA)
- File upload system
- Admin analytics dashboard

**Phase 3:**
- CI/CD pipeline (GitHub Actions)
- Automated testing in pipeline
- Cloud deployment scripts (AWS/GCP/DigitalOcean)
- Monitoring and alerting (Prometheus + Grafana)

**Phase 4:**
- Microservices architecture option
- Redis caching layer
- WebSocket support (real-time features)
- GraphQL API alternative
- Mobile app (React Native)

---

## 15. References

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Best Practices](https://react.dev/learn)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

*This PRD serves as the blueprint for the cookie-cutter web application template. It should be updated as requirements evolve and lessons are learned from real-world usage.*
