#!/bin/bash

echo "🚀 Starting SecureHealth Hospital Service (Simple Mode)..."

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

echo "🏥 Starting Hospital Service in development mode..."
echo "   Note: This will run with mock services (no MongoDB/Kafka required)"
echo ""

# Set environment variables for mock mode
export NODE_ENV=development
export PORT=3003
export MONGODB_URI=mock://localhost:27017/hospital-service
export KAFKA_BROKERS=mock://localhost:9092
export JWT_SECRET=your-jwt-secret-key-for-development
export ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Start the service
npm run start:dev
