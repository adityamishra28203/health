const axios = require('axios');
const colors = require('colors');

// Test configuration
const SERVICES = [
  { name: 'Hospital Service', url: 'http://localhost:3003/health', port: 3003 },
  { name: 'Notification Service', url: 'http://localhost:3006/health', port: 3006 },
  { name: 'Consent Service', url: 'http://localhost:3007/health', port: 3007 },
  { name: 'Audit Service', url: 'http://localhost:3008/health', port: 3008 },
  { name: 'Frontend', url: 'http://localhost:3000', port: 3000 },
  { name: 'API Gateway', url: 'http://localhost:8000', port: 8000 },
  { name: 'Prometheus', url: 'http://localhost:9090', port: 9090 },
  { name: 'Grafana', url: 'http://localhost:3001', port: 3001 }
];

const INFRASTRUCTURE = [
  { name: 'MongoDB', url: 'mongodb://localhost:27017', port: 27017 },
  { name: 'Redis', url: 'redis://localhost:6379', port: 6379 },
  { name: 'Elasticsearch', url: 'http://localhost:9200', port: 9200 },
  { name: 'MinIO', url: 'http://localhost:9000', port: 9000 }
];

async function testService(service) {
  try {
    const startTime = Date.now();
    const response = await axios.get(service.url, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      status: response.status,
      responseTime,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

async function testInfrastructure(infra) {
  // Simplified infrastructure test - just check if port is open
  const net = require('net');
  
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 2000;
    
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve({ success: true });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, error: 'Connection timeout' });
    });
    
    socket.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    socket.connect(infra.port, 'localhost');
  });
}

async function runTests() {
  console.log(colors.blue.bold('\n🧪 SecureHealth Platform - Deployment Test\n'));
  console.log(colors.blue('='.repeat(50)));
  
  // Test Application Services
  console.log(colors.yellow.bold('\n📱 Testing Application Services:'));
  console.log(colors.yellow('-'.repeat(30)));
  
  const serviceResults = [];
  for (const service of SERVICES) {
    process.stdout.write(`Testing ${service.name}... `);
    const result = await testService(service);
    
    if (result.success) {
      console.log(colors.green(`✅ OK (${result.responseTime}ms)`));
      if (result.data) {
        console.log(colors.gray(`   Status: ${JSON.stringify(result.data)}`));
      }
    } else {
      console.log(colors.red(`❌ FAILED (${result.error})`));
    }
    
    serviceResults.push({ service: service.name, ...result });
  }
  
  // Test Infrastructure
  console.log(colors.yellow.bold('\n🏗️ Testing Infrastructure:'));
  console.log(colors.yellow('-'.repeat(30)));
  
  const infraResults = [];
  for (const infra of INFRASTRUCTURE) {
    process.stdout.write(`Testing ${infra.name}... `);
    const result = await testInfrastructure(infra);
    
    if (result.success) {
      console.log(colors.green(`✅ OK`));
    } else {
      console.log(colors.red(`❌ FAILED (${result.error})`));
    }
    
    infraResults.push({ service: infra.name, ...result });
  }
  
  // Summary
  console.log(colors.blue.bold('\n📊 Test Summary:'));
  console.log(colors.blue('='.repeat(50)));
  
  const successfulServices = serviceResults.filter(r => r.success).length;
  const totalServices = serviceResults.length;
  const successfulInfra = infraResults.filter(r => r.success).length;
  const totalInfra = infraResults.length;
  
  console.log(colors.cyan(`Application Services: ${successfulServices}/${totalServices} healthy`));
  console.log(colors.cyan(`Infrastructure: ${successfulInfra}/${totalInfra} healthy`));
  
  const overallSuccess = (successfulServices === totalServices && successfulInfra === totalInfra);
  
  if (overallSuccess) {
    console.log(colors.green.bold('\n🎉 All services are healthy! Deployment successful!'));
  } else {
    console.log(colors.red.bold('\n⚠️  Some services are not responding. Check the logs above.'));
  }
  
  // Performance Analysis
  const avgResponseTime = serviceResults
    .filter(r => r.success && r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / 
    serviceResults.filter(r => r.success && r.responseTime).length;
  
  if (avgResponseTime) {
    console.log(colors.cyan(`\n⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`));
  }
  
  // Service URLs
  console.log(colors.blue.bold('\n🌐 Service URLs:'));
  console.log(colors.blue('='.repeat(50)));
  console.log(colors.white('🏠 Frontend:           http://localhost:3000'));
  console.log(colors.white('🏥 Hospital Service:   http://localhost:3003'));
  console.log(colors.white('🔔 Notification:       http://localhost:3006'));
  console.log(colors.white('✅ Consent Service:    http://localhost:3007'));
  console.log(colors.white('📊 Audit Service:      http://localhost:3008'));
  console.log(colors.white('🌐 API Gateway:        http://localhost:8000'));
  console.log(colors.white('📈 Prometheus:         http://localhost:9090'));
  console.log(colors.white('📊 Grafana:            http://localhost:3001'));
  
  return overallSuccess;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(colors.red.bold('\n💥 Test execution failed:'), error);
      process.exit(1);
    });
}

module.exports = { runTests, testService, testInfrastructure };


