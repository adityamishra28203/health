const mongoose = require('mongoose');

// User schema (same as test script)
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 8 },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'hospital_admin', 'insurer', 'system_admin'],
    default: 'patient' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification' 
  },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  emergencyContact: { type: String },
  bloodType: { type: String },
  allergies: [{ type: String }],
  medications: [{ type: String }],
  medicalConditions: [{ type: String }],
  organization: { type: String },
  licenseNumber: { type: String },
  specialization: { type: String },
  aadhaarNumber: { type: String },
  aadhaarVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  refreshTokens: [{ type: String }],
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

async function cleanupTestUser() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/healthwallet?authSource=admin';
    console.log('🔗 Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Database connected successfully!');
    
    // Find and delete test user
    console.log('\n🗑️ Looking for test user...');
    const testUser = await User.findOne({ email: 'test@healthwallet.com' });
    
    if (testUser) {
      console.log('👤 Found test user:');
      console.log('   ID:', testUser._id);
      console.log('   Email:', testUser.email);
      console.log('   Name:', testUser.firstName, testUser.lastName);
      console.log('   Created:', testUser.createdAt);
      
      // Delete the test user
      await User.findByIdAndDelete(testUser._id);
      console.log('✅ Test user deleted successfully!');
      
      // Verify deletion
      const deletedUser = await User.findById(testUser._id);
      if (!deletedUser) {
        console.log('✅ Verification: Test user has been completely removed');
      } else {
        console.log('❌ Warning: Test user still exists after deletion attempt');
      }
      
    } else {
      console.log('ℹ️  No test user found with email: test@healthwallet.com');
    }
    
    // Show remaining users count
    const userCount = await User.countDocuments();
    console.log('\n📊 Current users in database:', userCount);
    
    console.log('\n🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed.');
  }
}

// Run cleanup
if (require.main === module) {
  cleanupTestUser()
    .then(() => {
      console.log('\n✅ Cleanup completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupTestUser };
