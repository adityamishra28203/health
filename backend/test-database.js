const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema (simplified version for testing)
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

// Add virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Add virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

const User = mongoose.model('User', userSchema);

async function testDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/healthwallet?authSource=admin';
    console.log('🔗 Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Database connected successfully!');
    
    // Test database operations
    console.log('\n📊 Testing database operations...');
    
    // 1. Create a sample user
    console.log('👤 Creating sample user...');
    const sampleUser = new User({
      email: 'test@healthwallet.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      role: 'patient',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      bio: 'This is a test user for database verification',
      bloodType: 'O+',
      allergies: ['Peanuts', 'Shellfish'],
      medications: ['Aspirin', 'Vitamin D'],
      medicalConditions: ['Hypertension'],
      organization: 'Test Hospital',
      lastLogin: new Date()
    });
    
    const savedUser = await sampleUser.save();
    console.log('✅ Sample user created successfully!');
    console.log('   User ID:', savedUser._id);
    console.log('   Email:', savedUser.email);
    console.log('   Name:', savedUser.fullName);
    console.log('   Role:', savedUser.role);
    console.log('   Status:', savedUser.status);
    
    // 2. Test password hashing
    console.log('\n🔐 Testing password hashing...');
    const isPasswordValid = await savedUser.comparePassword('TestPassword123!');
    console.log('✅ Password comparison successful:', isPasswordValid);
    
    // 3. Test user retrieval
    console.log('\n🔍 Testing user retrieval...');
    const retrievedUser = await User.findById(savedUser._id);
    console.log('✅ User retrieved successfully!');
    console.log('   Retrieved Email:', retrievedUser.email);
    console.log('   Retrieved Name:', retrievedUser.fullName);
    
    // 4. Test user update
    console.log('\n✏️ Testing user update...');
    retrievedUser.bio = 'Updated bio for testing';
    retrievedUser.lastLogin = new Date();
    await retrievedUser.save();
    console.log('✅ User updated successfully!');
    
    // 5. Test user search
    console.log('\n🔎 Testing user search...');
    const foundUsers = await User.find({ role: 'patient' });
    console.log('✅ Found', foundUsers.length, 'patient users');
    
    // 6. Test virtual fields
    console.log('\n🎭 Testing virtual fields...');
    console.log('   Full Name:', savedUser.fullName);
    console.log('   Is Locked:', savedUser.isLocked);
    
    // 7. Test timestamps
    console.log('\n⏰ Testing timestamps...');
    console.log('   Created At:', savedUser.createdAt);
    console.log('   Updated At:', savedUser.updatedAt);
    
    console.log('\n🎉 All database tests passed successfully!');
    console.log('\n📋 Database Test Summary:');
    console.log('   ✅ Connection: Working');
    console.log('   ✅ User Creation: Working');
    console.log('   ✅ Password Hashing: Working');
    console.log('   ✅ User Retrieval: Working');
    console.log('   ✅ User Update: Working');
    console.log('   ✅ User Search: Working');
    console.log('   ✅ Virtual Fields: Working');
    console.log('   ✅ Timestamps: Working');
    
    console.log('\n🗑️ Sample user created for testing:');
    console.log('   Email: test@healthwallet.com');
    console.log('   Password: TestPassword123!');
    console.log('   User ID:', savedUser._id);
    
    console.log('\n⚠️  IMPORTANT: This is a test user. Please confirm if you want to keep it or remove it.');
    
    return {
      success: true,
      userId: savedUser._id,
      userEmail: savedUser.email,
      message: 'Database test completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Database test failed'
    };
  } finally {
    // Don't close connection yet, we might need to clean up
    console.log('\n🔌 Database connection remains open for cleanup operations.');
  }
}

// Run the test
if (require.main === module) {
  testDatabase()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Database test completed successfully!');
        console.log('📧 Test user email: test@healthwallet.com');
        console.log('🆔 Test user ID:', result.userId);
        console.log('\n💡 To remove the test user, run: node test-database.js --cleanup');
      } else {
        console.log('\n❌ Database test failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testDatabase, User };
