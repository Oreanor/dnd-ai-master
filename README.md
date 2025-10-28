# 🎲 D&D AI Master

A real-time multiplayer D&D game powered by AI, built with Next.js, Socket.IO, and Cohere AI.

## ✨ Features

- **Real-time multiplayer gameplay** with Socket.IO
- **AI-powered game master** using Cohere AI
- **Modern React architecture** with Next.js 16
- **TypeScript** for type safety
- **Comprehensive testing** with Jest and React Testing Library
- **Docker containerization** for easy deployment
- **CI/CD pipeline** with GitHub Actions
- **Kubernetes support** for production scaling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dnd-ai-master
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Web App: http://localhost:3000
   - Socket Server: http://localhost:3001

### Docker Development

```bash
# Start with Docker Compose
npm run docker:compose

# Or build and run manually
npm run docker:build
npm run docker:run
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check
```

## 🚀 Deployment

### Docker Deployment

```bash
# Deploy to local environment
npm run deploy

# On Windows
npm run deploy:windows
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
npm run k8s:deploy

# Check deployment status
npm run k8s:logs

# Scale the application
npm run k8s:scale
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `COHERE_API_KEY` | AI API key | Required |
| `NEXTAUTH_SECRET` | Auth secret | Required |
| `SOCKET_PORT` | Socket server port | `3001` |
| `REDIS_URL` | Redis connection | Optional |
| `DATABASE_URL` | PostgreSQL connection | Optional |

See [env.example](./env.example) for all available options.

## 🏗️ Architecture

```
├── app/                 # Next.js app directory
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Core business logic
├── server/             # Socket.IO server
├── utils/              # Utility functions
├── config/             # Configuration constants
├── types/              # TypeScript type definitions
├── k8s/                # Kubernetes manifests
├── scripts/            # Deployment scripts
└── __tests__/          # Test files
```

## 🔄 CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline with GitHub Actions:

- **Pull Request**: Runs tests, linting, and type checking
- **Push to develop**: Deploys to staging environment
- **Push to main**: Deploys to production with security scans

### Pipeline Features

- ✅ Automated testing
- ✅ Type checking
- ✅ Security scanning with Snyk
- ✅ Docker image building
- ✅ Multi-environment deployment
- ✅ Health checks
- ✅ Notifications

## 📊 Monitoring

### Health Checks

- **Application**: `GET /health`
- **Socket**: `GET /api/socket_io/health`

### Logs

```bash
# Docker Compose
docker-compose logs -f

# Kubernetes
kubectl logs -f deployment/dnd-ai-master -n dnd-ai-master
```

## 🔐 Security

- Input validation and sanitization
- Rate limiting protection
- CORS configuration
- Security headers
- Environment variable protection

## 📈 Performance

- Optimized Docker images
- Redis caching support
- Horizontal scaling with Kubernetes
- Nginx reverse proxy
- Gzip compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the [deployment guide](./DEPLOYMENT.md)
2. Review the test files for usage examples
3. Create an issue in the repository
4. Contact the development team

---

**Happy Gaming! 🎲✨**