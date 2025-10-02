// MongoDB initialization script for SecureHealth Platform
// This script runs when MongoDB container starts for the first time

// Switch to admin database
db = db.getSiblingDB('admin');

// Create databases for each service
db.getSiblingDB('hospital-service');
db.getSiblingDB('notification-service');
db.getSiblingDB('consent-service');
db.getSiblingDB('audit-service');

// Create service-specific users
db.createUser({
  user: 'hospital-service-user',
  pwd: 'hospital-service-pass',
  roles: [
    {
      role: 'readWrite',
      db: 'hospital-service'
    }
  ]
});

db.createUser({
  user: 'notification-service-user',
  pwd: 'notification-service-pass',
  roles: [
    {
      role: 'readWrite',
      db: 'notification-service'
    }
  ]
});

db.createUser({
  user: 'consent-service-user',
  pwd: 'consent-service-pass',
  roles: [
    {
      role: 'readWrite',
      db: 'consent-service'
    }
  ]
});

db.createUser({
  user: 'audit-service-user',
  pwd: 'audit-service-pass',
  roles: [
    {
      role: 'readWrite',
      db: 'audit-service'
    }
  ]
});

print('MongoDB initialization completed successfully!');
