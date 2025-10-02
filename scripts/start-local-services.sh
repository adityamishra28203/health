#!/bin/bash

# SecureHealth Platform - Local Service Startup (Without Docker)
# This script starts the services locally for development and testing

set -e

echo "🚀 SecureHealth Platform - Local Service Startup"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is available"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    print_success "npm $(npm --version) is available"
}

# Install dependencies for a service
install_service_deps() {
    local service_name=$1
    local service_path=$2
    
    if [ -d "$service_path" ]; then
        print_status "Installing dependencies for $service_name..."
        cd "$service_path"
        
        if [ -f "package.json" ]; then
            npm install --silent
            print_success "$service_name dependencies installed"
        else
            print_warning "No package.json found in $service_path"
        fi
        
        cd - > /dev/null
    else
        print_warning "$service_name directory not found: $service_path"
    fi
}

# Start a service in background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    local start_command=$4
    
    if [ -d "$service_path" ]; then
        print_status "Starting $service_name on port $port..."
        
        cd "$service_path"
        
        # Check if service is already running
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            print_warning "$service_name is already running on port $port"
        else
            # Start service in background
            if [ -n "$start_command" ]; then
                eval "$start_command" > "../logs/${service_name}.log" 2>&1 &
                echo $! > "../logs/${service_name}.pid"
            else
                npm run start:dev > "../logs/${service_name}.log" 2>&1 &
                echo $! > "../logs/${service_name}.pid"
            fi
            
            # Wait a moment for service to start
            sleep 3
            
            # Check if service started successfully
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
                print_success "$service_name started successfully on port $port"
            else
                print_error "$service_name failed to start on port $port"
                print_status "Check logs: logs/${service_name}.log"
            fi
        fi
        
        cd - > /dev/null
    else
        print_warning "$service_name directory not found: $service_path"
    fi
}

# Create logs directory
create_logs_dir() {
    print_status "Creating logs directory..."
    mkdir -p logs
    print_success "Logs directory created"
}

# Install all dependencies
install_all_dependencies() {
    print_status "Installing dependencies for all services..."
    
    install_service_deps "Frontend" "frontend"
    install_service_deps "Hospital Service" "services/hospital-service"
    install_service_deps "Notification Service" "services/notification-service"
    install_service_deps "Consent Service" "services/consent-service"
    install_service_deps "Audit Service" "services/audit-service"
}

# Start all services
start_all_services() {
    print_status "Starting all services..."
    
    # Start services in order (dependencies first)
    start_service "Hospital Service" "services/hospital-service" "3003"
    start_service "Notification Service" "services/notification-service" "3006"
    start_service "Consent Service" "services/consent-service" "3007"
    start_service "Audit Service" "services/audit-service" "3008"
    start_service "Frontend" "frontend" "3000"
}

# Test services
test_services() {
    print_status "Testing service endpoints..."
    
    # Test Hospital Service
    if curl -s -f http://localhost:3003/health > /dev/null 2>&1; then
        print_success "Hospital Service is responding"
    else
        print_warning "Hospital Service not responding yet"
    fi
    
    # Test Notification Service
    if curl -s -f http://localhost:3006/health > /dev/null 2>&1; then
        print_success "Notification Service is responding"
    else
        print_warning "Notification Service not responding yet"
    fi
    
    # Test Consent Service
    if curl -s -f http://localhost:3007/health > /dev/null 2>&1; then
        print_success "Consent Service is responding"
    else
        print_warning "Consent Service not responding yet"
    fi
    
    # Test Audit Service
    if curl -s -f http://localhost:3008/health > /dev/null 2>&1; then
        print_success "Audit Service is responding"
    else
        print_warning "Audit Service not responding yet"
    fi
    
    # Test Frontend
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is responding"
    else
        print_warning "Frontend not responding yet"
    fi
}

# Show service status
show_status() {
    print_success "🎉 Local services startup completed!"
    echo ""
    echo "📋 Service Status:"
    echo "=================="
    
    # Check which services are running
    for port in 3000 3003 3006 3007 3008; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            echo -e "✅ Port $port: Running"
        else
            echo -e "❌ Port $port: Not running"
        fi
    done
    
    echo ""
    echo "🌐 Service URLs:"
    echo "==============="
    echo "🏠 Frontend:           http://localhost:3000"
    echo "🏥 Hospital Service:   http://localhost:3003"
    echo "🔔 Notification:       http://localhost:3006"
    echo "✅ Consent Service:    http://localhost:3007"
    echo "📊 Audit Service:      http://localhost:3008"
    echo ""
    echo "📝 Logs:"
    echo "======="
    echo "📋 View logs:          tail -f logs/[service-name].log"
    echo "🔄 Restart service:    ./scripts/start-local-services.sh restart"
    echo "🛑 Stop all services:  ./scripts/start-local-services.sh stop"
    echo "🧹 Clean logs:         ./scripts/start-local-services.sh clean"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    
    for service in "Hospital Service" "Notification Service" "Consent Service" "Audit Service" "Frontend"; do
        local service_lower=$(echo "$service" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
        local pid_file="logs/${service_lower}.pid"
        
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid"
                print_success "$service stopped"
            else
                print_warning "$service was not running"
            fi
            rm "$pid_file"
        else
            print_warning "No PID file found for $service"
        fi
    done
}

# Clean logs
clean_logs() {
    print_status "Cleaning logs..."
    rm -rf logs/*
    print_success "Logs cleaned"
}

# Main execution
main() {
    echo "Starting SecureHealth Platform local services..."
    echo ""
    
    check_node
    check_npm
    create_logs_dir
    install_all_dependencies
    start_all_services
    
    # Wait a bit for services to fully start
    print_status "Waiting for services to start..."
    sleep 10
    
    test_services
    show_status
}

# Handle script arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        main
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_logs
        ;;
    "test")
        test_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|clean|test}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services (default)"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show service status"
        echo "  clean   - Clean logs"
        echo "  test    - Test service endpoints"
        exit 1
        ;;
esac


