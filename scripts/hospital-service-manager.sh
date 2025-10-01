#!/bin/bash

# Hospital Service Manager Script
# Usage: ./scripts/hospital-service-manager.sh [start|stop|status|test|logs]

HOSPITAL_SERVICE_DIR="services/hospital-service"
SERVICE_URL="http://localhost:3003"

function show_usage() {
    echo "🏥 Hospital Service Manager"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start    - Start the hospital service"
    echo "  stop     - Stop the hospital service"
    echo "  status   - Check service status"
    echo "  test     - Run comprehensive tests"
    echo "  logs     - Show service logs"
    echo "  health   - Check health endpoint"
    echo "  help     - Show this help message"
    echo ""
}

function start_service() {
    echo "🚀 Starting Hospital Service..."
    
    # Check if service is already running
    if pgrep -f "standalone-app.ts" > /dev/null; then
        echo "⚠️  Hospital Service is already running"
        return 1
    fi
    
    # Navigate to service directory
    cd "$HOSPITAL_SERVICE_DIR" || exit 1
    
    # Start the service in background
    nohup npm run start:standalone > hospital-service.log 2>&1 &
    SERVICE_PID=$!
    
    echo "📝 Service started with PID: $SERVICE_PID"
    echo "📋 Logs: $HOSPITAL_SERVICE_DIR/hospital-service.log"
    echo "🌐 Service URL: $SERVICE_URL"
    
    # Wait a moment and check if it started successfully
    sleep 3
    if curl -s "$SERVICE_URL/api/v1/hospitals/health" > /dev/null; then
        echo "✅ Hospital Service started successfully!"
    else
        echo "❌ Failed to start Hospital Service"
        return 1
    fi
}

function stop_service() {
    echo "🛑 Stopping Hospital Service..."
    
    # Find and kill the process
    PIDS=$(pgrep -f "standalone-app.ts")
    if [ -n "$PIDS" ]; then
        echo "📝 Found processes: $PIDS"
        kill $PIDS
        sleep 2
        
        # Force kill if still running
        PIDS=$(pgrep -f "standalone-app.ts")
        if [ -n "$PIDS" ]; then
            echo "🔨 Force killing processes: $PIDS"
            kill -9 $PIDS
        fi
        
        echo "✅ Hospital Service stopped"
    else
        echo "⚠️  Hospital Service is not running"
    fi
}

function check_status() {
    echo "📊 Hospital Service Status"
    echo ""
    
    # Check if process is running
    PIDS=$(pgrep -f "standalone-app.ts")
    if [ -n "$PIDS" ]; then
        echo "🟢 Status: Running (PID: $PIDS)"
    else
        echo "🔴 Status: Not running"
        return 1
    fi
    
    # Check health endpoint
    echo "🏥 Health Check:"
    if curl -s "$SERVICE_URL/api/v1/hospitals/health" > /dev/null; then
        echo "✅ Health endpoint responding"
    else
        echo "❌ Health endpoint not responding"
    fi
    
    # Show service info
    echo ""
    echo "📋 Service Information:"
    echo "   URL: $SERVICE_URL"
    echo "   Health: $SERVICE_URL/api/v1/hospitals/health"
    echo "   Register: $SERVICE_URL/api/v1/hospitals"
    echo "   List: $SERVICE_URL/api/v1/hospitals"
}

function run_tests() {
    echo "🧪 Running Hospital Service Tests..."
    
    # Check if service is running
    if ! curl -s "$SERVICE_URL/api/v1/hospitals/health" > /dev/null; then
        echo "❌ Service is not running. Please start it first."
        return 1
    fi
    
    # Run the test script
    if [ -f "scripts/test-hospital-standalone.js" ]; then
        node scripts/test-hospital-standalone.js
    else
        echo "❌ Test script not found: scripts/test-hospital-standalone.js"
        return 1
    fi
}

function check_health() {
    echo "🏥 Hospital Service Health Check"
    echo ""
    
    if curl -s "$SERVICE_URL/api/v1/hospitals/health" > /dev/null; then
        echo "✅ Service is healthy"
        echo ""
        echo "📋 Health Response:"
        curl -s "$SERVICE_URL/api/v1/hospitals/health" | jq '.' 2>/dev/null || curl -s "$SERVICE_URL/api/v1/hospitals/health"
    else
        echo "❌ Service is not responding"
        echo "   Make sure the service is running on port 3003"
    fi
}

function show_logs() {
    echo "📝 Hospital Service Logs"
    echo ""
    
    if [ -f "$HOSPITAL_SERVICE_DIR/hospital-service.log" ]; then
        tail -f "$HOSPITAL_SERVICE_DIR/hospital-service.log"
    else
        echo "❌ Log file not found: $HOSPITAL_SERVICE_DIR/hospital-service.log"
        echo "   The service might not be running or logs are not being written"
    fi
}

# Main script logic
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    status)
        check_status
        ;;
    test)
        run_tests
        ;;
    logs)
        show_logs
        ;;
    health)
        check_health
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
