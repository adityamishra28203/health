// MongoDB initialization script
db = db.getSiblingDB('healthwallet');

// Create collections
db.createCollection('users');
db.createCollection('healthrecords');
db.createCollection('insuranceclaims');
db.createCollection('notifications');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "aadhaarNumber": 1 }, { unique: true, sparse: true });
db.healthrecords.createIndex({ "patientId": 1 });
db.healthrecords.createIndex({ "createdAt": -1 });
db.insuranceclaims.createIndex({ "patientId": 1 });
db.insuranceclaims.createIndex({ "status": 1 });
db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "createdAt": -1 });

print('Database initialized successfully');
