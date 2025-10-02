#!/bin/bash

# SecureHealth Platform - Service Debugging Script
# This script helps debug and troubleshoot service issues

set -e

echo "🔧 SecureHealth Platform - Service Debugging"
echo "==========================================="

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

# Check system requirements
check_system() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        print_success "Node.js: $(node --version)"
    else
        print_error "Node.js not found"
        return 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        print_success "npm: $(npm --version)"
    else
        print_error "npm not found"
        return 1
    fi
    
    # Check curl
    if command -v curl &> /dev/null; then
        print_success "curl: $(curl --version | head -n1)"
    else
        print_error "curl not found"
        return 1
    fi
    
    # Check ports
    print_status "Checking port availability..."
    for port in 3000 3003 3006 3007 3008; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
            lsof -Pi :$port -sTCP:LISTEN
        else
            print_success "Port $port is available"
        fi
    done
}

# Check service dependencies
check_dependencies() {
    print_status "Checking service dependencies..."
    
    local services=("frontend" "services/hospital-service" "services/notification-service" "services/consent-service" "services/audit-service")
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            if [ -f "$service/package.json" ]; then
                if [ -d "$service/node_modules" ]; then
                    print_success "$service: Dependencies installed"
                else
                    print_warning "$service: Dependencies not installed"
                fi
            else
                print_error "$service: No package.json found"
            fi
        else
            print_error "$service: Directory not found"
        fi
    done
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    local services=(
        "Hospital Service:3003"
        "Notification Service:3006"
        "Consent Service:3007"
        "Audit Service:3008"
        "Frontend:3000"
    )
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service_info"
        
        print_status "Testing $name..."
        if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
            print_success "$name is healthy"
        elif curl -s -f "http://localhost:$port" > /dev/null 2>&1; then
            print_success "$name is responding (no health endpoint)"
        else
            print_error "$name is not responding"
        fi
    done
}

# Show service logs
show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        print_status "Available log files:"
        if [ -d "logs" ]; then
            ls -la logs/
        else
            print_warning "No logs directory found"
        fi
        return
    fi
    
    local log_file="logs/${service}.log"
    if [ -f "$log_file" ]; then
        print_status "Showing logs for $service:"
        echo "----------------------------------------"
        tail -n 50 "$log_file"
        echo "----------------------------------------"
        print_status "To follow logs in real-time: tail -f $log_file"
    else
        print_error "Log file not found: $log_file"
    fi
}

# Test API endpoints
test_apis() {
    print_status "Testing API endpoints..."
    
    # Test Hospital Service endpoints
    print_status "Testing Hospital Service APIs..."
    if curl -s -f "http://localhost:3003/health" > /dev/null; then
        print_success "Hospital Service health endpoint OK"
    else
        print_error "Hospital Service health endpoint failed"
    fi
    
    # Test Notification Service endpoints
    print_status "Testing Notification Service APIs..."
    if curl -s -f "http://localhost:3006/health" > /dev/null; then
        print_success "Notification Service health endpoint OK"
    else
        print_error "Notification Service health endpoint failed"
    fi
    
    # Test Consent Service endpoints
    print_status "Testing Consent Service APIs..."
    if curl -s -f "http://localhost:3007/health" > /dev/null; then
        print_success "Consent Service health endpoint OK"
    else
        print_error "Consent Service health endpoint failed"
    fi
    
    # Test Audit Service endpoints
    print_status "Testing Audit Service APIs..."
    if curl -s -f "http://localhost:3008/health" > /dev/null; then
        print_success "Audit Service health endpoint OK"
    else
        print_error "Audit Service health endpoint failed"
    fi
}

# Show process information
show_processes() {
    print_status "Showing service processes..."
    
    echo "Node.js processes:"
    ps aux | grep node | grep -v grep || print_warning "No Node.js processes found"
    
    echo ""
    echo "Port usage:"
    for port in 3000 3003 3006 3007 3008; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "Port $port:"
            lsof -Pi :$port -sTCP:LISTEN
        fi
    done
}

# Fix common issues
fix_issues() {
    print_status "Attempting to fix common issues..."
    
    # Install missing dependencies
    print_status "Installing missing dependencies..."
    local services=("frontend" "services/hospital-service" "services/notification-service" "services/consent-service" "services/audit-service")
    
    for service in "${services[@]}"; do
        if [ -d "$service" ] && [ -f "$service/package.json" ]; then
            if [ ! -d "$service/node_modules" ]; then
                print_status "Installing dependencies for $service..."
                cd "$service"
                npm install --silent
                cd - > /dev/null
                print_success "Dependencies installed for $service"
            fi
        fi
    done
    
    # Clean npm cache
    print_status "Cleaning npm cache..."
    npm cache clean --force
    print_success "NPM cache cleaned"
    
    # Remove lock files and reinstall
    print_status "Removing lock files and reinstalling..."
    find . -name "package-lock.json" -delete
    find . -name "yarn.lock" -delete
    
    for service in "${services[@]}"; do
        if [ -d "$service" ] && [ -f "$service/package.json" ]; then
            print_status "Reinstalling dependencies for $service..."
            cd "$service"
            rm -rf node_modules
            npm install --silent
            cd - > /dev/null
        fi
    done
    
    print_success "Common issues fixed"
}

# Main execution
main() {
    case "${1:-check}" in
        "check")
            check_system
            check_dependencies
            check_health
            ;;
        "logs")
            show_logs "$2"
            ;;
        "test")
            test_apis
            ;;
        "processes")
            show_processes
            ;;
        "fix")
            fix_issues
            ;;
        "all")
            check_system
            check_dependencies
            check_health
            test_apis
            show_processes
            ;;
        *)
            echo "Usage: $0 {check|logs|test|processes|fix|all} [service-name]"
            echo ""
            echo "Commands:"
            echo "  check     - Check system requirements and service health (default)"
            echo "  logs      - Show service logs (optionally for specific service)"
            echo "  test      - Test API endpoints"
            echo "  processes - Show running processes"
            echo "  fix       - Attempt to fix common issues"
            echo "  all       - Run all checks"
            echo ""
            echo "Examples:"
            echo "  $0 check"
            echo "  $0 logs hospital-service"
            echo "  $0 test"
            exit 1
            ;;
    esac
}

main "$@"


