#!/bin/bash

# HealthWallet Microservices Deployment Script
# This script deploys all microservices using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p data/mongodb
    mkdir -p data/redis
    mkdir -p data/minio
    mkdir -p data/prometheus
    mkdir -p data/grafana
    
    print_success "Directories created"
}

# Build all services
build_services() {
    print_status "Building all services..."
    
    # Build API Gateway
    print_status "Building API Gateway..."
    docker-compose build api-gateway
    
    # Build Auth Service
    print_status "Building Auth Service..."
    docker-compose build auth-service
    
    # Build Profile Service
    print_status "Building Profile Service..."
    docker-compose build profile-service
    
    # Build Document Service
    print_status "Building Document Service..."
    docker-compose build document-service
    
    # Build Timeline Service
    print_status "Building Timeline Service..."
    docker-compose build timeline-service
    
    print_success "All services built successfully"
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    # Start databases and message queue
    docker-compose up -d mongodb redis kafka zookeeper minio
    
    # Wait for services to be ready
    print_status "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "mongodb.*Up"; then
        print_success "MongoDB is running"
    else
        print_error "MongoDB failed to start"
        exit 1
    fi
    
    if docker-compose ps | grep -q "redis.*Up"; then
        print_success "Redis is running"
    else
        print_error "Redis failed to start"
        exit 1
    fi
    
    if docker-compose ps | grep -q "kafka.*Up"; then
        print_success "Kafka is running"
    else
        print_error "Kafka failed to start"
        exit 1
    fi
}

# Start microservices
start_services() {
    print_status "Starting microservices..."
    
    # Start all services
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 60
    
    # Check service health
    check_service_health
}

# Check service health
check_service_health() {
    print_status "Checking service health..."
    
    # Check API Gateway
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "API Gateway is healthy"
    else
        print_error "API Gateway health check failed"
    fi
    
    # Check Auth Service
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Auth Service is healthy"
    else
        print_error "Auth Service health check failed"
    fi
    
    # Check Profile Service
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        print_success "Profile Service is healthy"
    else
        print_error "Profile Service health check failed"
    fi
    
    # Check Document Service
    if curl -f http://localhost:3003/health > /dev/null 2>&1; then
        print_success "Document Service is healthy"
    else
        print_error "Document Service health check failed"
    fi
    
    # Check Timeline Service
    if curl -f http://localhost:3004/health > /dev/null 2>&1; then
        print_success "Timeline Service is healthy"
    else
        print_error "Timeline Service health check failed"
    fi
}

# Start monitoring services
start_monitoring() {
    print_status "Starting monitoring services..."
    
    # Start Prometheus and Grafana
    docker-compose up -d prometheus grafana
    
    print_success "Monitoring services started"
    print_status "Prometheus: http://localhost:9090"
    print_status "Grafana: http://localhost:3001 (admin/admin123)"
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  API Gateway: http://localhost:3000"
    echo "  Auth Service: http://localhost:3001"
    echo "  Profile Service: http://localhost:3002"
    echo "  Document Service: http://localhost:3003"
    echo "  Timeline Service: http://localhost:3004"
    echo "  MongoDB: mongodb://localhost:27017"
    echo "  Redis: redis://localhost:6379"
    echo "  MinIO: http://localhost:9000 (minioadmin/minioadmin123)"
    echo "  Prometheus: http://localhost:9090"
    echo "  Grafana: http://localhost:3001"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup completed"
}

# Show logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Main function
main() {
    case "${1:-deploy}" in
        "deploy")
            print_status "Starting HealthWallet Microservices Deployment..."
            check_docker
            check_docker_compose
            create_directories
            build_services
            start_infrastructure
            start_services
            start_monitoring
            show_status
            print_success "Deployment completed successfully!"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 5
            main deploy
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "health")
            check_service_health
            ;;
        *)
            echo "Usage: $0 {deploy|stop|restart|cleanup|status|logs|health}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy all services (default)"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            echo "  cleanup  - Stop and clean up all services and volumes"
            echo "  status   - Show service status"
            echo "  logs     - Show logs (optionally for specific service)"
            echo "  health   - Check service health"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
