# 🚀 Deployment Guide

This guide covers different deployment options for the D&D AI Master application.

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Kubernetes cluster (for production)
- Git

## 🐳 Docker Deployment

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dnd-ai-master
   ```

2. **Copy environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application:**
   ```bash
   # Using Docker Compose
   docker-compose up -d
   
   # Or using the deploy script
   ./scripts/deploy.sh
   # On Windows: .\scripts\deploy.ps1
   ```

4. **Access the application:**
   - Web App: http://localhost:3000
   - Socket Server: http://localhost:3001
   - Redis: localhost:6379
   - PostgreSQL: localhost:5432

### Production Docker

1. **Build the image:**
   ```bash
   docker build -t dnd-ai-master:latest .
   ```

2. **Run with environment variables:**
   ```bash
   docker run -d \
     --name dnd-ai-master \
     -p 3000:3000 \
     -p 3001:3001 \
     -e COHERE_API_KEY=your-key \
     -e NEXTAUTH_SECRET=your-secret \
     dnd-ai-master:latest
   ```

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm (optional)

### Deploy to Kubernetes

1. **Create namespace:**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```

2. **Create secrets:**
   ```bash
   kubectl create secret generic dnd-ai-secrets \
     --from-literal=cohere-api-key=your-key \
     --from-literal=nextauth-secret=your-secret \
     --from-literal=postgres-password=your-password \
     -n dnd-ai-master
   ```

3. **Deploy application:**
   ```bash
   kubectl apply -f k8s/
   ```

4. **Check deployment:**
   ```bash
   kubectl get pods -n dnd-ai-master
   kubectl get services -n dnd-ai-master
   ```

### Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment dnd-ai-master --replicas=5 -n dnd-ai-master
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **On Pull Request:**
   - Runs tests
   - Builds application
   - Runs security scans

2. **On Push to `develop`:**
   - All PR checks
   - Deploys to staging
   - Builds Docker image

3. **On Push to `main`:**
   - All checks
   - Deploys to production
   - Security scans
   - Notifications

### Required Secrets

Add these secrets to your GitHub repository:

- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `SNYK_TOKEN`: Snyk security token
- `KUBECONFIG`: Kubernetes configuration (base64 encoded)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Next.js port | `3000` |
| `SOCKET_PORT` | Socket server port | `3001` |
| `COHERE_API_KEY` | AI API key | Required |
| `NEXTAUTH_SECRET` | Auth secret | Required |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `DATABASE_URL` | PostgreSQL connection | Optional |

### Rate Limiting

Configure rate limits via environment variables:

```bash
RATE_LIMIT_PLAYER_ACTION_REQUESTS=5
RATE_LIMIT_PLAYER_ACTION_WINDOW=15000
RATE_LIMIT_ROOM_JOIN_REQUESTS=3
RATE_LIMIT_ROOM_JOIN_WINDOW=60000
RATE_LIMIT_AI_REQUEST_REQUESTS=10
RATE_LIMIT_AI_REQUEST_WINDOW=60000
```

## 📊 Monitoring

### Health Checks

- **Application:** `GET /health`
- **Socket:** `GET /api/socket_io/health`

### Logs

```bash
# Docker Compose
docker-compose logs -f

# Kubernetes
kubectl logs -f deployment/dnd-ai-master -n dnd-ai-master
```

### Metrics

The application exposes metrics on `/metrics` endpoint for Prometheus scraping.

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   ```

2. **Docker build fails:**
   ```bash
   # Clear Docker cache
   docker system prune -a
   ```

3. **Kubernetes pods not starting:**
   ```bash
   # Check pod status
   kubectl describe pod <pod-name> -n dnd-ai-master
   ```

4. **Socket connection issues:**
   - Check CORS configuration
   - Verify socket server is running
   - Check firewall settings

### Performance Tuning

1. **Increase resources:**
   ```yaml
   resources:
     requests:
       memory: "512Mi"
       cpu: "500m"
     limits:
       memory: "1Gi"
       cpu: "1000m"
   ```

2. **Enable Redis caching:**
   ```bash
   # Add Redis to your deployment
   kubectl apply -f k8s/redis.yaml
   ```

## 🔐 Security

### Production Checklist

- [ ] Use HTTPS/TLS
- [ ] Set strong secrets
- [ ] Enable rate limiting
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Monitor logs
- [ ] Backup data

### SSL/TLS Setup

1. **Generate certificates:**
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/private.key -out ssl/certificate.crt
   ```

2. **Update ingress:**
   ```yaml
   tls:
   - hosts:
     - your-domain.com
     secretName: dnd-ai-tls
   ```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale application
kubectl scale deployment dnd-ai-master --replicas=10 -n dnd-ai-master

# Scale Redis
kubectl scale deployment redis --replicas=3 -n dnd-ai-master
```

### Vertical Scaling

Update resource limits in `k8s/deployment.yaml`:

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "1000m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

## 🆘 Support

For issues and questions:

1. Check the logs
2. Review this documentation
3. Create an issue in the repository
4. Contact the development team

---

**Happy Gaming! 🎲**
