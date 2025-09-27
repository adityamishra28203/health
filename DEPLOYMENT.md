# HealthWallet Deployment Guide

This guide covers deployment strategies for the HealthWallet application in different environments.

## 🚀 Deployment Options

### 1. Docker Compose (Recommended for Development/Staging)

### 2. Kubernetes (Production)

### 3. Cloud Platforms (AWS, GCP, Azure)

### 4. VPS/Server Deployment

## 🐳 Docker Compose Deployment

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum
- 20GB storage minimum

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd blockchain-health-wallet

# Create environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# Edit environment variables
nano .env
nano frontend/.env.local

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Environment Configuration

#### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://mongodb:27017/healthwallet
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Blockchain
ETHEREUM_RPC_URL=http://ganache:8545
CONTRACT_ADDRESS=0x1234567890abcdef

# IPFS
IPFS_URL=http://ipfs:5001

# Server
PORT=3001
NODE_ENV=production
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_IPFS_URL=http://localhost:5001
NEXT_PUBLIC_BLOCKCHAIN_URL=http://localhost:8545
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/healthwallet
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:5.0
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.0+ (optional)

### Namespace Setup

```yaml
# deployment/k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: healthwallet
```

### ConfigMaps and Secrets

```yaml
# deployment/k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: healthwallet-config
  namespace: healthwallet
data:
  MONGODB_URI: "mongodb://mongodb:27017/healthwallet"
  REDIS_URL: "redis://redis:6379"
  JWT_EXPIRES_IN: "7d"
  PORT: "3001"
  NODE_ENV: "production"
```

```yaml
# deployment/k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: healthwallet-secrets
  namespace: healthwallet
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  MONGODB_PASSWORD: <base64-encoded-password>
```

### MongoDB Deployment

```yaml
# deployment/k8s/mongodb.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: healthwallet
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:5.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: healthwallet-secrets
              key: MONGODB_PASSWORD
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
      volumes:
      - name: mongodb-storage
        persistentVolumeClaim:
          claimName: mongodb-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: healthwallet
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: healthwallet
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### Backend Deployment

```yaml
# deployment/k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: healthwallet
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: healthwallet/backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: healthwallet-config
        - secretRef:
            name: healthwallet-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: healthwallet
spec:
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
```

### Frontend Deployment

```yaml
# deployment/k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: healthwallet
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: healthwallet/frontend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: healthwallet
spec:
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
```

### Ingress Configuration

```yaml
# deployment/k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: healthwallet-ingress
  namespace: healthwallet
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.healthwallet.com
    - app.healthwallet.com
    secretName: healthwallet-tls
  rules:
  - host: api.healthwallet.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3001
  - host: app.healthwallet.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
```

### Deploy to Kubernetes

```bash
# Apply all configurations
kubectl apply -f deployment/k8s/

# Check deployment status
kubectl get pods -n healthwallet
kubectl get services -n healthwallet
kubectl get ingress -n healthwallet

# View logs
kubectl logs -f deployment/backend -n healthwallet
kubectl logs -f deployment/frontend -n healthwallet
```

## ☁️ Cloud Platform Deployment

### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster --name healthwallet --region us-west-2 --nodegroup-name workers --node-type t3.medium --nodes 3

# Deploy application
kubectl apply -f deployment/k8s/

# Set up Load Balancer
kubectl apply -f deployment/aws/load-balancer.yaml
```

### Google Cloud GKE

```bash
# Create GKE cluster
gcloud container clusters create healthwallet --zone us-central1-a --num-nodes 3

# Deploy application
kubectl apply -f deployment/k8s/

# Set up Ingress
kubectl apply -f deployment/gcp/ingress.yaml
```

### Azure AKS

```bash
# Create AKS cluster
az aks create --resource-group healthwallet --name healthwallet --node-count 3 --enable-addons monitoring --generate-ssh-keys

# Deploy application
kubectl apply -f deployment/k8s/
```

## 🖥️ VPS/Server Deployment

### Prerequisites

- Ubuntu 20.04+ or CentOS 8+
- Docker and Docker Compose
- Nginx
- SSL certificate (Let's Encrypt)

### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.0.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd blockchain-health-wallet

# Create environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# Edit configuration
nano .env
nano frontend/.env.local

# Start application
docker-compose up -d

# Set up SSL
sudo certbot --nginx -d your-domain.com
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/healthwallet
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 Production Configuration

### Environment Variables

#### Backend Production (.env)
```bash
# Database
MONGODB_URI=mongodb://username:password@mongodb:27017/healthwallet?authSource=admin
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secure-production-secret-key
JWT_EXPIRES_IN=7d

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
CONTRACT_ADDRESS=0x1234567890abcdef

# IPFS
IPFS_URL=https://ipfs.infura.io:5001

# Server
PORT=3001
NODE_ENV=production

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Production (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_IPFS_URL=https://ipfs.your-domain.com
NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
```

### Security Hardening

#### Docker Security
```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Remove unnecessary packages
RUN apk del .build-deps

# Use specific versions
FROM node:18-alpine
```

#### Nginx Security
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# Hide server version
server_tokens off;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... proxy configuration
}

location /auth/login {
    limit_req zone=login burst=5 nodelay;
    # ... proxy configuration
}
```

### Monitoring and Logging

#### Health Checks
```yaml
# Kubernetes health checks
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

#### Logging Configuration
```yaml
# Docker logging
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Backup Strategy

#### Database Backup
```bash
# MongoDB backup
docker exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# Restore
docker exec mongodb mongorestore /backup/20250101
```

#### File Storage Backup
```bash
# IPFS backup
docker exec ipfs ipfs get <hash> /backup/
```

### Scaling

#### Horizontal Pod Autoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: healthwallet
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Service Not Starting
```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Restart service
docker-compose restart service-name
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
docker exec mongodb mongo --eval "db.adminCommand('ismaster')"

# Check Redis status
docker exec redis redis-cli ping
```

#### 3. SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

#### 4. Kubernetes Issues
```bash
# Check pod status
kubectl get pods -n healthwallet

# Check events
kubectl get events -n healthwallet

# Describe pod
kubectl describe pod <pod-name> -n healthwallet
```

### Performance Optimization

#### Database Optimization
```javascript
// MongoDB indexes
db.healthrecords.createIndex({ "patientId": 1, "createdAt": -1 })
db.insuranceclaims.createIndex({ "patientId": 1, "status": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })
```

#### Caching Strategy
```yaml
# Redis caching
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-config
data:
  redis.conf: |
    maxmemory 256mb
    maxmemory-policy allkeys-lru
```

## 📊 Monitoring

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'healthwallet-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "HealthWallet Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      }
    ]
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push Docker images
        run: |
          docker build -t healthwallet/backend:${{ github.sha }} ./backend
          docker build -t healthwallet/frontend:${{ github.sha }} ./frontend
          
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/backend backend=healthwallet/backend:${{ github.sha }}
          kubectl set image deployment/frontend frontend=healthwallet/frontend:${{ github.sha }}
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] Database backups completed
- [ ] DNS records updated
- [ ] Load balancer configured
- [ ] Monitoring setup

### Post-deployment
- [ ] Health checks passing
- [ ] SSL certificate valid
- [ ] Database connectivity confirmed
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Monitoring alerts configured
- [ ] Backup strategy verified

## 🆘 Support

For deployment support:
- **Email**: devops@healthwallet.com
- **Documentation**: https://docs.healthwallet.com/deployment
- **Status Page**: https://status.healthwallet.com
