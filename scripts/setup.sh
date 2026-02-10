#!/bin/bash

# WebApp Template Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up WebApp Template..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env files if they don't exist
echo "📝 Setting up environment variables..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created root .env file"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend .env file"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend .env file"
fi

echo ""
echo "⚠️  IMPORTANT: Please update the .env files with secure secrets before deploying to production!"
echo ""

# Ask user which mode to run
echo "Which mode would you like to run?"
echo "1) Development (with hot reload)"
echo "2) Production"
read -p "Enter your choice (1 or 2): " mode

if [ "$mode" == "1" ]; then
    echo "🔨 Building and starting development environment..."
    docker compose -f docker-compose.dev.yml up --build -d
    
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    echo "🗄️  Running database migrations..."
    docker exec webapp-backend-dev npx prisma migrate dev --name init
    
    echo ""
    echo "✅ Development environment is ready!"
    echo "📱 Frontend: http://localhost:5173"
    echo "🔧 Backend API: http://localhost:3000"
    echo "🏥 Health Check: http://localhost:3000/api/health"
    echo ""
    echo "To view logs: docker compose -f docker-compose.dev.yml logs -f"
    echo "To stop: docker compose -f docker-compose.dev.yml down"
    
elif [ "$mode" == "2" ]; then
    echo "🔨 Building and starting production environment..."
    docker compose up --build -d
    
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    echo "🗄️  Running database migrations..."
    docker exec webapp-backend npx prisma migrate deploy
    
    echo ""
    echo "✅ Production environment is ready!"
    echo "📱 Frontend: http://localhost"
    echo "🔧 Backend API: http://localhost:3000"
    echo "🏥 Health Check: http://localhost:3000/api/health"
    echo ""
    echo "To view logs: docker compose logs -f"
    echo "To stop: docker compose down"
    
else
    echo "❌ Invalid choice. Please run the script again."
    exit 1
fi

echo ""
echo "🎉 Setup complete! Happy coding!"
