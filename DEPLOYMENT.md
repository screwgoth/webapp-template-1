# Deployment Guide

This guide covers deploying your WebApp Template to various platforms.

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Security
- [ ] Changed all default JWT secrets in `.env`
- [ ] Updated `JWT_SECRET` with a strong random string (32+ characters)
- [ ] Updated `JWT_REFRESH_SECRET` with a different strong random string
- [ ] Configured proper `CORS_ORIGIN` (your production frontend URL)
- [ ] Reviewed and adjusted rate limiting settings
- [ ] Set `NODE_ENV=production` in backend environment
- [ ] Removed any test/debug code

### Database
- [ ] Set up production PostgreSQL database
- [ ] Configured `DATABASE_URL` with production credentials
- [ ] Enabled SSL connection if required
- [ ] Set up automated backups
- [ ] Configured connection pooling if needed

### Environment Variables
- [ ] Created production `.env` files (never commit these!)
- [ ] Verified all required variables are set
- [ ] Tested database connection
- [ ] Confirmed API URLs are correct

### Code Quality
- [ ] All TypeScript compilation passes (`npm run build`)
- [ ] No console errors in production build
- [ ] Tested all authentication flows
- [ ] Verified all API endpoints work
- [ ] Checked responsive design on mobile

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Self-Hosted)

**Best for:** DigitalOcean Droplets, AWS EC2, Any VPS

1. **Set up server**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt install docker-compose-plugin
   ```

2. **Clone and configure**
   ```bash
   git clone <your-repo>
   cd webapp-template-1
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit .env files with production values
   ```

3. **Update docker-compose.yml**
   ```yaml
   # Set production secrets
   JWT_SECRET: ${JWT_SECRET}
   JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
   
   # Add domain/SSL if using reverse proxy
   ```

4. **Deploy**
   ```bash
   docker compose up -d
   docker exec webapp-backend npx prisma migrate deploy
   ```

5. **Set up nginx reverse proxy (optional)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:80;
       }
   }
   ```

6. **Enable SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

### Option 2: Railway (Easiest)

**Best for:** Quick deployments, startups, MVPs

1. **Create Railway account**: https://railway.app

2. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Add "backend" as root directory
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=<your-secret>
     JWT_REFRESH_SECRET=<your-refresh-secret>
     CORS_ORIGIN=https://your-frontend.up.railway.app
     ```
   - Railway will auto-detect Dockerfile

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically links DATABASE_URL

4. **Run migrations**
   - In Railway dashboard, open backend service
   - Go to "Deployments" → Click latest → "View Logs"
   - Or run locally: `DATABASE_URL=<railway-url> npx prisma migrate deploy`

5. **Deploy Frontend**
   - Add new service from same repo
   - Set root directory to "frontend"
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend.up.railway.app
     ```

6. **Custom Domain (Optional)**
   - Go to service settings
   - Add custom domain
   - Update CORS_ORIGIN in backend

**Cost**: ~$5/month for small apps

---

### Option 3: Vercel (Frontend) + Render (Backend)

**Best for:** Separate frontend/backend deployment

#### Backend on Render

1. Create account at https://render.com

2. **New Web Service**
   - Connect GitHub repo
   - Root directory: `backend`
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `node dist/index.js`

3. **Add PostgreSQL database**
   - Dashboard → New → PostgreSQL
   - Copy internal database URL

4. **Environment variables**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<render-postgres-url>
   JWT_SECRET=<your-secret>
   JWT_REFRESH_SECRET=<your-refresh-secret>
   CORS_ORIGIN=https://your-app.vercel.app
   ```

5. **Run migration**
   - Go to "Shell" tab
   - Run: `npx prisma migrate deploy`

#### Frontend on Vercel

1. Create account at https://vercel.com

2. **Import repository**
   - Click "New Project"
   - Import from GitHub
   - Root directory: `frontend`
   - Framework: Vite

3. **Environment variables**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy**
   - Vercel auto-deploys on git push
   - Custom domain in project settings

**Cost**: Free tier available, ~$7/month backend

---

### Option 4: AWS (Advanced)

**Best for:** Enterprise, scalability, complex requirements

Components needed:
- **ECS/Fargate**: Docker containers
- **RDS**: PostgreSQL database
- **ALB**: Load balancer
- **S3 + CloudFront**: Static frontend
- **ECR**: Docker registry
- **Route53**: DNS

Steps:
1. Build and push Docker images to ECR
2. Create RDS PostgreSQL instance
3. Set up ECS cluster with Fargate
4. Configure task definitions
5. Set up Application Load Balancer
6. Deploy frontend to S3 + CloudFront
7. Configure environment variables in ECS
8. Run migrations as one-time task

**Cost**: ~$50-200/month depending on usage

---

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Backend
        run: |
          cd backend
          npm ci
          npm run build
      
      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build
      
      - name: Deploy to Production
        run: |
          # Add your deployment commands here
          # e.g., docker build & push, kubectl apply, etc.
```

Add secrets in GitHub repo settings:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL`

---

## 📊 Monitoring & Logging

### Application Monitoring

1. **Sentry** (Error tracking)
   ```bash
   npm install @sentry/node @sentry/react
   ```
   Add to backend/frontend initialization

2. **LogRocket** (Session replay)
   ```bash
   npm install logrocket
   ```

3. **Uptime monitoring**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

### Database Monitoring

- Enable slow query logs
- Set up connection pooling (PgBouncer)
- Monitor disk space
- Configure automated backups

---

## 🔐 Production Security

1. **Environment Variables**
   - Never commit .env files
   - Use secret management (AWS Secrets Manager, HashiCorp Vault)
   - Rotate secrets regularly

2. **HTTPS**
   - Always use SSL/TLS in production
   - Redirect HTTP to HTTPS
   - Use Let's Encrypt for free certificates

3. **Database**
   - Use connection string with SSL
   - Whitelist IP addresses
   - Strong password
   - Regular backups

4. **Rate Limiting**
   - Adjust based on your needs
   - Consider CDN-level protection (Cloudflare)

5. **Updates**
   - Keep dependencies updated
   - Subscribe to security advisories
   - Run `npm audit` regularly

---

## 🧪 Testing Production

After deployment:

1. **Health Check**
   ```bash
   curl https://your-api.com/api/health
   ```

2. **Run test script**
   ```bash
   ./scripts/test-api.sh https://your-api.com
   ```

3. **Manual testing**
   - Sign up new user
   - Sign in
   - Update profile
   - Change password
   - Test all features

4. **Load testing** (optional)
   ```bash
   # Install k6
   brew install k6
   
   # Create test script
   k6 run load-test.js
   ```

---

## 🔄 Rollback Strategy

If deployment fails:

### Docker Compose
```bash
docker compose down
git checkout <previous-commit>
docker compose up -d
```

### Railway/Render
- Click "Rollback" in dashboard
- Redeploy previous commit

### Vercel
- Go to Deployments
- Click "..." on previous deployment
- Select "Promote to Production"

---

## 📝 Post-Deployment

- [ ] Test all functionality
- [ ] Verify SSL certificate
- [ ] Check error logging
- [ ] Monitor performance
- [ ] Set up alerts
- [ ] Document any custom configuration
- [ ] Share credentials with team (securely)
- [ ] Update DNS if needed
- [ ] Configure CDN if applicable

---

## 🆘 Troubleshooting

### Database connection fails
```bash
# Test connection
psql $DATABASE_URL

# Check SSL requirement
# Add ?sslmode=require to DATABASE_URL if needed
```

### CORS errors
- Verify CORS_ORIGIN matches frontend URL (no trailing slash)
- Check browser console for actual origin
- Ensure credentials: true in axios

### Migration errors
```bash
# Check migration status
npx prisma migrate status

# Force reset (⚠️ deletes data)
npx prisma migrate reset

# Deploy specific migration
npx prisma migrate deploy
```

### Build failures
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build

# Check Node version
node -v  # Should be 20+
```

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Docs](https://docs.docker.com/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [nginx Configuration](https://nginx.org/en/docs/)

---

**Good luck with your deployment! 🚀**

If you encounter issues, check the logs:
```bash
# Docker
docker compose logs -f backend

# Railway
# View in dashboard

# Linux server
journalctl -u your-service -f
```
