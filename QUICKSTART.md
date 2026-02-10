# Quick Start Guide

Get your WebApp Template up and running in 5 minutes!

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 20+** (optional, for local development)
- **Git** installed

## 🚀 Quick Start with Docker (Recommended)

### Option 1: Automated Setup

Run the setup script:

```bash
./scripts/setup.sh
```

The script will:
1. Create environment files
2. Ask if you want dev or production mode
3. Build and start Docker containers
4. Run database migrations
5. Display access URLs

### Option 2: Manual Setup

**Development Mode:**

```bash
# 1. Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Start services
docker compose -f docker-compose.dev.yml up -d

# 3. Run migrations
docker exec webapp-backend-dev npx prisma migrate dev --name init

# 4. Access the app
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

**Production Mode:**

```bash
# 1. Create environment files and update secrets
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with secure values!

# 2. Start services
docker compose up -d

# 3. Run migrations
docker exec webapp-backend npx prisma migrate deploy

# 4. Access the app
# Frontend: http://localhost
# Backend: http://localhost:3000
```

## 🧪 Test the Application

1. **Check Health**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Create an Account**
   - Navigate to http://localhost (or :5173 for dev)
   - Click "Sign Up"
   - Enter your details
   - Password must be 8+ characters with uppercase, lowercase, and number

3. **Explore the Dashboard**
   - View the dashboard with sample stats
   - Try the Settings page to update your profile
   - Test changing your password

## 📋 Useful Commands

```bash
# View logs
docker compose logs -f                           # Production
docker compose -f docker-compose.dev.yml logs -f # Development

# Stop services
docker compose down                              # Production
docker compose -f docker-compose.dev.yml down    # Development

# Restart a service
docker compose restart backend
docker compose restart frontend

# Open Prisma Studio (database GUI)
docker exec -it webapp-backend-dev npx prisma studio

# Access backend shell
docker exec -it webapp-backend sh

# View database
docker exec -it webapp-postgres psql -U postgres -d webapp_db
```

## 🔧 Local Development (Without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Set up PostgreSQL locally
createdb webapp_db

# 3. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Update DATABASE_URL in backend/.env

# 4. Run migrations
cd backend
npx prisma migrate dev
npx prisma generate

# 5. Start dev servers (from root)
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :3000  # Backend
sudo lsof -i :5173  # Frontend (dev)
sudo lsof -i :80    # Frontend (prod)

# Kill the process or change ports in .env files
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### Permission Denied

```bash
# Make setup script executable
chmod +x scripts/setup.sh

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
# Log out and back in
```

### Migration Errors

```bash
# Reset database (⚠️ deletes all data)
docker compose down -v
docker compose up -d postgres
docker exec webapp-backend npx prisma migrate reset
```

## 📚 Next Steps

- Read the full [README.md](./README.md)
- Check the [API documentation](#api-endpoints) in README
- Customize the UI components in `frontend/src/components/`
- Add your business logic to `backend/src/routes/`
- Configure security settings for production

## 🎉 You're Ready!

Your full-stack application is now running with:
- ✅ Authentication system
- ✅ User management
- ✅ Responsive UI
- ✅ Database with ORM
- ✅ Docker containerization
- ✅ Production-ready security

Start building your features on top of this solid foundation!

---

**Made by screwgoth** • [Full Documentation](./README.md)
