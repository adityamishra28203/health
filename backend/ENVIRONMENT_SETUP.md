# Backend Environment Configuration

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/healthwallet

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=healthify-31b19
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@healthify-31b19.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://healthwallet.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here
```

## Firebase Admin SDK Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `healthify-31b19`
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the values and add them to your `.env` file

## Security Features Implemented

### 1. **JWT Authentication with Secure Cookies**
- ✅ Access tokens (15 minutes expiry)
- ✅ Refresh tokens (7 days expiry)
- ✅ httpOnly cookies with SameSite=strict
- ✅ Secure cookie options for production

### 2. **Password Security**
- ✅ bcrypt hashing with 12 rounds
- ✅ Account lockout after 5 failed attempts
- ✅ Password complexity requirements
- ✅ Secure password comparison

### 3. **Rate Limiting**
- ✅ Global rate limiting (100 requests/15 minutes)
- ✅ Authentication rate limiting (5 attempts/15 minutes)
- ✅ OTP rate limiting (1 OTP/minute)
- ✅ Password reset rate limiting (3 attempts/hour)

### 4. **Security Headers**
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Content Security Policy
- ✅ XSS protection
- ✅ CSRF protection

### 5. **Input Validation**
- ✅ Express-validator for request validation
- ✅ Email format validation
- ✅ Password strength validation
- ✅ Phone number validation
- ✅ Name validation

### 6. **Firebase Integration**
- ✅ Firebase Admin SDK for server-side operations
- ✅ Phone OTP verification
- ✅ Google Sign-in verification
- ✅ Email verification links
- ✅ Password reset links

## API Endpoints

### Authentication Endpoints
- `POST /auth/phone-otp` - Phone OTP sign-in
- `POST /auth/google` - Google sign-in
- `POST /auth/signup` - Email/password sign-up
- `POST /auth/signin` - Email/password sign-in
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Security Features
- ✅ JWT token verification
- ✅ Role-based access control
- ✅ Email verification requirement
- ✅ Phone verification requirement
- ✅ Account lockout protection
- ✅ Secure cookie management

## Testing the Authentication System

### 1. **Phone OTP Flow**
```bash
# 1. Frontend sends Firebase ID token after phone verification
curl -X POST http://localhost:3001/auth/phone-otp \
  -H "Content-Type: application/json" \
  -d '{"idToken": "firebase-id-token", "role": "patient"}'
```

### 2. **Google Sign-in Flow**
```bash
# 1. Frontend sends Firebase ID token after Google auth
curl -X POST http://localhost:3001/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "firebase-id-token", "role": "patient"}'
```

### 3. **Email/Password Flow**
```bash
# Sign up
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!", "firstName": "John", "lastName": "Doe"}'

# Sign in
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!"}'
```

### 4. **Token Refresh**
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Cookie: refreshToken=your-refresh-token"
```

### 5. **Get Current User**
```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer your-access-token"
```

## Production Deployment

### Environment Variables for Production
```bash
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_ACCESS_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### Security Considerations
1. **Use strong JWT secrets** (32+ characters)
2. **Enable HTTPS** in production
3. **Use secure MongoDB connection**
4. **Set up proper CORS origins**
5. **Monitor rate limiting**
6. **Regular security audits**
7. **Keep dependencies updated**

## Tradeoffs Explained

### **Secure Cookies vs JWT in LocalStorage**

**✅ Chosen: Secure Cookies + Refresh Tokens**

**Advantages:**
- ✅ **httpOnly cookies** prevent XSS attacks
- ✅ **SameSite=strict** prevents CSRF attacks
- ✅ **Automatic cookie management** by browser
- ✅ **Refresh token rotation** for security
- ✅ **Server-side token revocation**

**Disadvantages:**
- ❌ **Slightly more complex** implementation
- ❌ **Requires cookie handling** in frontend
- ❌ **CSRF protection needed** (implemented)

**Alternative: JWT in LocalStorage**
- ❌ **Vulnerable to XSS** attacks
- ❌ **No automatic expiration** handling
- ❌ **Harder to revoke** tokens
- ✅ **Simpler implementation**

## Next Steps

1. **Set up environment variables**
2. **Configure Firebase Admin SDK**
3. **Test authentication flows**
4. **Deploy to production**
5. **Monitor security metrics**
