const axios = require('axios');

const HOSPITAL_SERVICE_URL = 'http://localhost:3003';

async function testHospitalService() {
  console.log('🏥 Testing Hospital Service...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${HOSPITAL_SERVICE_URL}/api/v1/health`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test hospital registration
    console.log('\n2. Testing hospital registration...');
    try {
      const hospitalData = {
        name: 'Test Hospital',
        registrationNumber: 'HOSP123456',
        type: 'general',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '123456',
          country: 'India'
        },
        contactInfo: {
          phone: '+91-9876543210',
          email: 'test@hospital.com',
          website: 'https://testhospital.com'
        },
        specialties: ['Cardiology', 'Neurology'],
        kycDocuments: ['registration_cert.pdf'],
        ownerEmail: 'admin@testhospital.com',
        ownerName: 'Test Admin'
      };

      const registrationResponse = await axios.post(
        `${HOSPITAL_SERVICE_URL}/api/v1/hospitals`,
        hospitalData
      );
      console.log('✅ Hospital registration successful:', registrationResponse.data);
      
      const hospitalId = registrationResponse.data.hospitalId;
      
      // Test getting hospital details
      console.log('\n3. Testing get hospital details...');
      try {
        const getHospitalResponse = await axios.get(
          `${HOSPITAL_SERVICE_URL}/api/v1/hospitals/${hospitalId}`
        );
        console.log('✅ Get hospital details successful:', getHospitalResponse.data);
      } catch (error) {
        console.log('❌ Get hospital details failed:', error.message);
      }

      // Test patient search
      console.log('\n4. Testing patient search...');
      try {
        const searchData = {
          abhaId: '12345678901234'
        };
        
        const searchResponse = await axios.post(
          `${HOSPITAL_SERVICE_URL}/api/v1/hospitals/${hospitalId}/patients/search`,
          searchData
        );
        console.log('✅ Patient search successful:', searchResponse.data);
      } catch (error) {
        console.log('❌ Patient search failed:', error.message);
      }

    } catch (error) {
      console.log('❌ Hospital registration failed:', error.message);
    }

    console.log('\n🎉 Hospital Service testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testHospitalService();
