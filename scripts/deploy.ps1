# Deploy script for D&D AI Master (Windows PowerShell)
param(
    [string]$DockerTag = "latest",
    [string]$Environment = "staging"
)

# Configuration
$APP_NAME = "dnd-ai-master"
$DOCKER_IMAGE = "dnd-ai-master"

Write-Host "🚀 Starting deployment of $APP_NAME" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Docker tag: $DockerTag" -ForegroundColor Yellow

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Build Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
docker build -t "${DOCKER_IMAGE}:${DockerTag}" .

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
docker run --rm "${DOCKER_IMAGE}:${DockerTag}" npm test

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Start new containers
Write-Host "▶️ Starting new containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Health check
Write-Host "🏥 Running health checks..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application is healthy" -ForegroundColor Green
    } else {
        throw "Health check failed"
    }
} catch {
    Write-Host "❌ Health check failed" -ForegroundColor Red
    docker-compose logs
    exit 1
}

# Show running containers
Write-Host "📋 Running containers:" -ForegroundColor Green
docker-compose ps

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "Application URL: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Socket URL: http://localhost:3001" -ForegroundColor Yellow
