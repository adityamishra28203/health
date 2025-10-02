#!/bin/bash

# SecureHealth Platform - Local Deployment and Testing Script
# This script deploys the enhanced architecture locally and runs comprehensive tests

set -e

echo "🚀 SecureHealth Platform - Local Deployment and Testing"
echo "======================================================"

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
    print_status "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p kong
    mkdir -p scripts
    print_success "Directories created"
}

# Install dependencies for services
install_dependencies() {
    print_status "Installing dependencies for all services..."
    
    # Install Hospital Service dependencies
    if [ -d "services/hospital-service" ]; then
        print_status "Installing Hospital Service dependencies..."
        cd services/hospital-service
        npm install --silent
        cd ../..
        print_success "Hospital Service dependencies installed"
    fi
    
    # Install Notification Service dependencies
    if [ -d "services/notification-service" ]; then
        print_status "Installing Notification Service dependencies..."
        cd services/notification-service
        npm install --silent
        cd ../..
        print_success "Notification Service dependencies installed"
    fi
    
    # Install Consent Service dependencies
    if [ -d "services/consent-service" ]; then
        print_status "Installing Consent Service dependencies..."
        cd services/consent-service
        npm install --silent
        cd ../..
        print_success "Consent Service dependencies installed"
    fi
    
    # Install Audit Service dependencies
    if [ -d "services/audit-service" ]; then
        print_status "Installing Audit Service dependencies..."
        cd services/audit-service
        npm install --silent
        cd ../..
        print_success "Audit Service dependencies installed"
    fi
    
    # Install Frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing Frontend dependencies..."
        cd frontend
        npm install --silent
        cd ..
        print_success "Frontend dependencies installed"
    fi
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    # Start only infrastructure services first
    docker-compose -f docker-compose.local-enhanced.yml up -d \
        mongodb \
        postgres \
        redis \
        zookeeper \
        kafka \
        elasticsearch \
        minio
    
    print_status "Waiting for infrastructure services to be healthy..."
    sleep 30
    
    # Check health of infrastructure services
    print_status "Checking infrastructure service health..."
    
    # Check MongoDB
    if docker-compose -f docker-compose.local-enhanced.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB is healthy"
    else
        print_warning "MongoDB health check failed, but continuing..."
    fi
    
    # Check Redis
    if docker-compose -f docker-compose.local-enhanced.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is healthy"
    else
        print_warning "Redis health check failed, but continuing..."
    fi
    
    # Check Kafka
    if docker-compose -f docker-compose.local-enhanced.yml exec -T kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
        print_success "Kafka is healthy"
    else
        print_warning "Kafka health check failed, but continuing..."
    fi
    
    print_success "Infrastructure services started"
}

# Start application services
start_application_services() {
    print_status "Starting application services..."
    
    # Start application services
    docker-compose -f docker-compose.local-enhanced.yml up -d \
        hospital-service \
        notification-service \
        consent-service \
        audit-service
    
    print_status "Waiting for application services to start..."
    sleep 20
    
    print_success "Application services started"
}

# Start frontend and monitoring
start_frontend_monitoring() {
    print_status "Starting frontend and monitoring services..."
    
    # Start frontend and monitoring
    docker-compose -f docker-compose.local-enhanced.yml up -d \
        frontend \
        api-gateway \
        prometheus \
        grafana
    
    print_status "Waiting for frontend and monitoring to start..."
    sleep 15
    
    print_success "Frontend and monitoring services started"
}

# Test service endpoints
test_services() {
    print_status "Testing service endpoints..."
    
    # Test Hospital Service
    print_status "Testing Hospital Service..."
    if curl -s -f http://localhost:3003/health > /dev/null; then
        print_success "Hospital Service is responding"
    else
        print_warning "Hospital Service health check failed"
    fi
    
    # Test Notification Service
    print_status "Testing Notification Service..."
    if curl -s -f http://localhost:3006/health > /dev/null; then
        print_success "Notification Service is responding"
    else
        print_warning "Notification Service health check failed"
    fi
    
    # Test Consent Service
    print_status "Testing Consent Service..."
    if curl -s -f http://localhost:3007/health > /dev/null; then
        print_success "Consent Service is responding"
    else
        print_warning "Consent Service health check failed"
    fi
    
    # Test Audit Service
    print_status "Testing Audit Service..."
    if curl -s -f http://localhost:3008/health > /dev/null; then
        print_success "Audit Service is responding"
    else
        print_warning "Audit Service health check failed"
    fi
    
    # Test Frontend
    print_status "Testing Frontend..."
    if curl -s -f http://localhost:3000 > /dev/null; then
        print_success "Frontend is responding"
    else
        print_warning "Frontend health check failed"
    fi
    
    # Test API Gateway
    print_status "Testing API Gateway..."
    if curl -s -f http://localhost:8000 > /dev/null; then
        print_success "API Gateway is responding"
    else
        print_warning "API Gateway health check failed"
    fi
    
    # Test Prometheus
    print_status "Testing Prometheus..."
    if curl -s -f http://localhost:9090 > /dev/null; then
        print_success "Prometheus is responding"
    else
        print_warning "Prometheus health check failed"
    fi
    
    # Test Grafana
    print_status "Testing Grafana..."
    if curl -s -f http://localhost:3001 > /dev/null; then
        print_success "Grafana is responding"
    else
        print_warning "Grafana health check failed"
    fi
}

# Run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    # Create a simple test script
    cat > test-integration.js << 'EOF'
const axios = require('axios');

const services = [
    { name: 'Hospital Service', url: 'http://localhost:3003/health' },
    { name: 'Notification Service', url: 'http://localhost:3006/health' },
    { name: 'Consent Service', url: 'http://localhost:3007/health' },
    { name: 'Audit Service', url: 'http://localhost:3008/health' },
    { name: 'Frontend', url: 'http://localhost:3000' },
    { name: 'API Gateway', url: 'http://localhost:8000' },
    { name: 'Prometheus', url: 'http://localhost:9090' },
    { name: 'Grafana', url: 'http://localhost:3001' }
];

async function testServices() {
    console.log('🧪 Running integration tests...\n');
    
    for (const service of services) {
        try {
            const response = await axios.get(service.url, { timeout: 5000 });
            console.log(`✅ ${service.name}: OK (${response.status})`);
        } catch (error) {
            console.log(`❌ ${service.name}: FAILED (${error.message})`);
        }
    }
    
    console.log('\n🎉 Integration tests completed!');
}

testServices().catch(console.error);
EOF
    
    # Run the test
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        npm install axios --silent
        node test-integration.js
        rm test-integration.js
    else
        print_warning "Node.js not available, skipping integration tests"
    fi
}

# Show service URLs
show_service_urls() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Service URLs:"
    echo "================"
    echo "🏠 Frontend:           http://localhost:3000"
    echo "🏥 Hospital Service:   http://localhost:3003"
    echo "🔔 Notification Service: http://localhost:3006"
    echo "✅ Consent Service:    http://localhost:3007"
    echo "📊 Audit Service:      http://localhost:3008"
    echo "🌐 API Gateway:        http://localhost:8000"
    echo "📈 Prometheus:         http://localhost:9090"
    echo "📊 Grafana:            http://localhost:3001 (admin/admin123)"
    echo ""
    echo "🗄️ Infrastructure:"
    echo "=================="
    echo "🍃 MongoDB:            mongodb://localhost:27017"
    echo "🐘 PostgreSQL:         postgresql://localhost:5432"
    echo "🔴 Redis:              redis://localhost:6379"
    echo "📨 Kafka:              localhost:9092"
    echo "🔍 Elasticsearch:      http://localhost:9200"
    echo "📦 MinIO:              http://localhost:9000"
    echo ""
    echo "🔧 Management:"
    echo "=============="
    echo "📋 View logs:          docker-compose -f docker-compose.local-enhanced.yml logs [service-name]"
    echo "🔄 Restart service:    docker-compose -f docker-compose.local-enhanced.yml restart [service-name]"
    echo "🛑 Stop all:           docker-compose -f docker-compose.local-enhanced.yml down"
    echo "🗑️ Clean up:           docker-compose -f docker-compose.local-enhanced.yml down -v"
}

# Main execution
main() {
    echo "Starting SecureHealth Platform deployment..."
    echo ""
    
    check_docker
    check_docker_compose
    create_directories
    install_dependencies
    
    print_status "Starting deployment process..."
    start_infrastructure
    start_application_services
    start_frontend_monitoring
    
    print_status "Running health checks and tests..."
    test_services
    run_integration_tests
    
    show_service_urls
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose -f docker-compose.local-enhanced.yml down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose -f docker-compose.local-enhanced.yml restart
        print_success "All services restarted"
        ;;
    "logs")
        service_name="${2:-}"
        if [ -n "$service_name" ]; then
            docker-compose -f docker-compose.local-enhanced.yml logs -f "$service_name"
        else
            docker-compose -f docker-compose.local-enhanced.yml logs -f
        fi
        ;;
    "clean")
        print_status "Cleaning up all containers and volumes..."
        docker-compose -f docker-compose.local-enhanced.yml down -v
        docker system prune -f
        print_success "Cleanup completed"
        ;;
    "test")
        test_services
        run_integration_tests
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|logs|clean|test}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy all services (default)"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  logs    - Show logs (optionally for specific service)"
        echo "  clean   - Clean up all containers and volumes"
        echo "  test    - Run health checks and integration tests"
        exit 1
        ;;
esac


