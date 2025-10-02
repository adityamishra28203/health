# Production Kubernetes Manifests

This directory contains the production-specific Kubernetes manifests for the Hospital Portal application.

## Structure

- `frontend-deployment.yaml` - Frontend application deployment
- `backend-deployment.yaml` - Backend services deployment
- `api-gateway.yaml` - API Gateway configuration
- `mongodb-deployment.yaml` - MongoDB deployment
- `monitoring.yaml` - Monitoring stack configuration

## Deployment

To deploy to production:

1. Ensure you have access to the production cluster
2. Apply the namespace first:
   ```bash
   kubectl apply -f ../namespace.yaml
   ```

3. Apply the production manifests:
   ```bash
   kubectl apply -f .
   ```

4. Verify the deployment:
   ```bash
   kubectl get pods -n hospital-portal
   kubectl get services -n hospital-portal
   kubectl get ingress -n hospital-portal
   ```

## Environment Variables

The production deployment uses the following environment variables:

- `NODE_ENV=production`
- `MONGODB_URI` - From Kubernetes secret
- `JWT_SECRET` - From Kubernetes secret
- `ALLOWED_ORIGINS` - Production domains

## Secrets

Create the following secrets in the production namespace:

```bash
# MongoDB connection string
kubectl create secret generic mongodb-secret \
  --from-literal=uri="mongodb://your-production-mongodb-uri" \
  -n hospital-portal

# JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=secret="your-production-jwt-secret" \
  -n hospital-portal
```

## Monitoring

The production deployment includes:
- Prometheus for metrics collection
- Grafana for visualization
- Jaeger for distributed tracing
- ELK stack for logging

## Security

- All traffic is encrypted with TLS
- Secrets are managed via Kubernetes secrets
- Network policies restrict traffic between pods
- RBAC is configured for service accounts

## Scaling

The deployment is configured with:
- Frontend: 3 replicas
- Backend: 2 replicas
- API Gateway: 2 replicas

To scale:
```bash
kubectl scale deployment frontend-deployment --replicas=5 -n hospital-portal
kubectl scale deployment hospital-service --replicas=3 -n hospital-portal
```
