const axios = require('axios');

const HOSPITAL_SERVICE_URL = 'http://localhost:3003/api/v1/hospitals';

async function testHospitalService() {
  console.log('🏥 Testing Hospital Service (Standalone Mode)...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${HOSPITAL_SERVICE_URL}/health`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }

    // Test hospital registration
    console.log('\n2. Testing hospital registration...');
    try {
      const hospitalData = {
        name: 'SecureHealth Medical Center',
        registrationNumber: 'SHMC2024001',
        type: 'general',
        address: {
          street: '456 Healthcare Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        },
        contactInfo: {
          phone: '+91-9876543210',
          email: 'info@securehealth.com',
          website: 'https://securehealth.com'
        },
        specialties: ['Cardiology', 'Neurology', 'Orthopedics'],
        kycDocuments: ['registration_cert.pdf', 'license.pdf'],
        ownerEmail: 'admin@securehealth.com',
        ownerName: 'Dr. Secure Health'
      };

      const registrationResponse = await axios.post(
        HOSPITAL_SERVICE_URL,
        hospitalData
      );
      console.log('✅ Hospital registration successful:', registrationResponse.data);
      
      const hospitalId = registrationResponse.data.hospitalId;
      
      // Test getting hospital details
      console.log('\n3. Testing get hospital details...');
      try {
        const getHospitalResponse = await axios.get(
          `${HOSPITAL_SERVICE_URL}/${hospitalId}`
        );
        console.log('✅ Get hospital details successful:', getHospitalResponse.data);
      } catch (error) {
        console.log('❌ Get hospital details failed:', error.message);
      }

      // Test getting all hospitals
      console.log('\n4. Testing get all hospitals...');
      try {
        const getAllHospitalsResponse = await axios.get(HOSPITAL_SERVICE_URL);
        console.log('✅ Get all hospitals successful:', getAllHospitalsResponse.data);
        console.log(`   Found ${getAllHospitalsResponse.data.total} hospitals`);
      } catch (error) {
        console.log('❌ Get all hospitals failed:', error.message);
      }

    } catch (error) {
      console.log('❌ Hospital registration failed:', error.message);
    }

    console.log('\n🎉 Hospital Service testing completed!');
    console.log('\n📋 Available endpoints:');
    console.log('   - Health Check: GET /api/v1/hospitals/health');
    console.log('   - Register Hospital: POST /api/v1/hospitals');
    console.log('   - Get All Hospitals: GET /api/v1/hospitals');
    console.log('   - Get Hospital: GET /api/v1/hospitals/{id}');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testHospitalService();
