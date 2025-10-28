#!/bin/bash

# Deploy script for D&D AI Master
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="dnd-ai-master"
DOCKER_IMAGE="dnd-ai-master"
DOCKER_TAG=${1:-latest}
ENVIRONMENT=${2:-staging}

echo -e "${GREEN}🚀 Starting deployment of ${APP_NAME}${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Docker tag: ${DOCKER_TAG}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Build Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
docker run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} npm test

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down || true

# Start new containers
echo -e "${YELLOW}▶️ Starting new containers...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    docker-compose logs
    exit 1
fi

# Show running containers
echo -e "${GREEN}📋 Running containers:${NC}"
docker-compose ps

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}Application URL: http://localhost:3000${NC}"
echo -e "${YELLOW}Socket URL: http://localhost:3001${NC}"
