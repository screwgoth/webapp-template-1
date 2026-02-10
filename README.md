# WebApp Template

A production-ready, full-stack web application template with modern technologies and best practices.

**Made by screwgoth • Version 1.0.0**

## 🚀 Features

- **Full-stack TypeScript** - Type safety across frontend and backend
- **Modern React** - React 18 with hooks and functional components
- **Beautiful UI** - Tailwind CSS + shadcn/ui components
- **Secure Authentication** - JWT-based auth with refresh tokens
- **Database ORM** - Prisma with PostgreSQL
- **Docker Ready** - Full containerization for dev and production
- **API Rate Limiting** - Protection against abuse
- **Request Logging** - Winston logger for monitoring
- **Password Security** - bcrypt hashing with strength validation
- **Responsive Design** - Mobile-first approach with collapsible sidebar
- **Audit Logging** - Track important user actions

## 📋 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors

### Backend
- **Node.js 20** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Modern database ORM
- **PostgreSQL 16** - Robust relational database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Winston** - Logging library
- **Zod** - Schema validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **nginx** - Reverse proxy for frontend
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🏗️ Project Structure

```
webapp-template/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types & Zod schemas
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Application entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── Dockerfile          # Production Docker config
│   ├── Dockerfile.dev      # Development Docker config
│   └── package.json
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── lib/            # Utility functions
│   ├── Dockerfile          # Production Docker config
│   ├── Dockerfile.dev      # Development Docker config
│   ├── nginx.conf          # nginx configuration
│   └── package.json
├── docker-compose.yml      # Production compose config
├── docker-compose.dev.yml  # Development compose config
└── package.json            # Root package.json with workspaces
```

## 🚀 Getting Started

**⚡ Quick Start:** See [QUICKSTART.md](./QUICKSTART.md) for the fastest way to get running!

### Prerequisites

- **Node.js 20+**
- **Docker & Docker Compose** (recommended)
- **PostgreSQL 16** (if not using Docker)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd webapp-template-1
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Run with Docker Compose**

   **Development mode** (with hot reload):
   ```bash
   docker compose -f docker-compose.dev.yml up
   ```

   **Production mode**:
   ```bash
   docker compose up -d
   ```

4. **Run database migrations**
   ```bash
   # In development
   docker exec webapp-backend-dev npx prisma migrate dev

   # In production (first time setup)
   docker exec webapp-backend npx prisma migrate deploy
   ```

5. **Access the application**
   - Frontend: http://localhost (production) or http://localhost:5173 (dev)
   - Backend API: http://localhost:3000
   - API Health: http://localhost:3000/api/health

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL**
   - Install PostgreSQL 16
   - Create a database named `webapp_db`

3. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit with your database credentials
   ```

4. **Run database migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This runs both frontend (port 5173) and backend (port 3000) concurrently.

## 🔐 Authentication Flow

1. **Sign Up**: POST `/api/auth/register`
   - Creates user with hashed password
   - Returns access token + refresh token
   - Stores refresh token in database

2. **Sign In**: POST `/api/auth/login`
   - Validates credentials
   - Returns access token + refresh token

3. **Access Protected Routes**
   - Include `Authorization: Bearer <access_token>` header
   - Access token expires in 1 hour

4. **Refresh Token**: POST `/api/auth/refresh`
   - Automatically handled by frontend API client
   - Extends session without re-login

5. **Logout**: POST `/api/auth/logout`
   - Invalidates refresh token

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user
- `DELETE /api/users/me` - Delete current user account

### Health
- `GET /api/health` - Service health check

## 🎨 UI Components

The template includes these pre-built pages:

- **Sign In** - Email/password login with remember me
- **Sign Up** - Registration with password strength indicator
- **Forgot Password** - Password reset request
- **Dashboard** - Main application view with stats cards
- **Settings** - User profile and password management
- **404 Not Found** - Custom error page

### Layout Components

- **Header** - Logo, notifications, user dropdown
- **Sidebar** - Collapsible navigation (responsive)
- **Footer** - Attribution and version info

## 🔒 Security Features

- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - 100 requests per 15 minutes
- **CORS Protection** - Configured allowed origins
- **Helmet** - Security headers
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **XSS Protection** - React escaping + security headers

## 🧪 Development

### Available Scripts

**Root:**
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both applications
- `npm run lint` - Lint all code
- `npm run format` - Format with Prettier

**Backend:**
- `npm run dev --workspace=backend` - Start backend dev server
- `npm run build --workspace=backend` - Build backend
- `npm run prisma:migrate --workspace=backend` - Run migrations
- `npm run prisma:studio --workspace=backend` - Open Prisma Studio

**Frontend:**
- `npm run dev --workspace=frontend` - Start frontend dev server
- `npm run build --workspace=frontend` - Build frontend
- `npm run preview --workspace=frontend` - Preview production build

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webapp_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
```

## 🐳 Docker Commands

```bash
# Build images
docker compose build

# Start services (detached)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Remove volumes (⚠️ deletes data)
docker compose down -v

# Development mode
docker compose -f docker-compose.dev.yml up

# Execute command in container
docker exec webapp-backend npx prisma migrate dev
```

## 📊 Database Schema

```prisma
User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

Session {
  id           String   @id @default(uuid())
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}

AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  resource  String?
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

## 🚀 Deployment

### Production Checklist

1. **Update environment variables**
   - Change all secret keys
   - Update CORS_ORIGIN
   - Set NODE_ENV=production

2. **Database**
   - Use managed PostgreSQL service
   - Run migrations: `npx prisma migrate deploy`
   - Enable connection pooling

3. **Security**
   - Enable HTTPS
   - Use strong JWT secrets
   - Configure rate limiting for your needs
   - Set up monitoring and alerts

4. **Build & Deploy**
   ```bash
   docker compose -f docker-compose.yml up -d
   ```

### Recommended Platforms

- **Vercel/Netlify** - Frontend
- **Railway/Render** - Backend + Database
- **DigitalOcean/AWS** - Full stack with Docker
- **Fly.io** - PostgreSQL database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**screwgoth**

## 🙏 Acknowledgments

- shadcn for the amazing UI components
- Prisma team for the excellent ORM
- The open-source community

---

**Version 1.0.0** • Made with ❤️ by screwgoth
