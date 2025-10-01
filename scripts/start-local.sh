#!/bin/bash

echo "🚀 Starting SecureHealth Hospital Portal Locally..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies for Hospital Service..."
cd services/hospital-service
npm install

echo "🐳 Starting Docker services (MongoDB, Redis, Kafka)..."
cd ../..
docker-compose -f docker-compose.local.yml up -d mongodb redis zookeeper kafka

echo "⏳ Waiting for services to start..."
sleep 10

echo "🏥 Starting Hospital Service..."
cd services/hospital-service
npm run start:dev &

HOSPITAL_PID=$!

echo "⏳ Waiting for Hospital Service to start..."
sleep 15

echo "🧪 Running tests..."
cd ../..
node scripts/test-hospital-service.js

echo ""
echo "✅ Local setup complete!"
echo ""
echo "📋 Service URLs:"
echo "   - Hospital Service: http://localhost:3003"
echo "   - MongoDB: mongodb://localhost:27017"
echo "   - Redis: redis://localhost:6379"
echo "   - Kafka: localhost:9092"
echo ""
echo "📚 API Documentation:"
echo "   - Swagger UI: http://localhost:3003/api/docs"
echo ""
echo "🛑 To stop services:"
echo "   - Press Ctrl+C to stop Hospital Service"
echo "   - Run: docker-compose -f docker-compose.local.yml down"
echo ""

# Wait for user to stop
wait $HOSPITAL_PID
