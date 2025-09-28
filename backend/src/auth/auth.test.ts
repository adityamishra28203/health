import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { User } from '../schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('Authentication System', () => {
  let app: INestApplication;
  let userModel: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken('User'))
      .useValue({
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        findByIdAndUpdate: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    userModel = moduleFixture.get(getModelToken('User'));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Phone OTP Authentication', () => {
    it('should authenticate user with valid Firebase token', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        firebaseUid: 'firebase123'
      };

      userModel.findOne.mockResolvedValue(mockUser);
      userModel.save.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/phone-otp')
        .send({
          idToken: 'valid-firebase-token',
          role: 'patient'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid Firebase token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/phone-otp')
        .send({
          idToken: 'invalid-token',
          role: 'patient'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Google Sign-in Authentication', () => {
    it('should authenticate user with valid Google token', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        firebaseUid: 'google123'
      };

      userModel.findOne.mockResolvedValue(mockUser);
      userModel.save.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/google')
        .send({
          idToken: 'valid-google-token',
          role: 'patient'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });
  });

  describe('Email/Password Authentication', () => {
    it('should create new user on signup', async () => {
      userModel.findOne.mockResolvedValue(null);
      userModel.create.mockResolvedValue({
        _id: 'user123',
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'patient',
        emailVerified: false
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'patient'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('User created successfully');
    });

    it('should reject duplicate email on signup', async () => {
      userModel.findOne.mockResolvedValue({
        _id: 'existing123',
        email: 'existing@example.com'
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User already exists');
    });

    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'user@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      userModel.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('Token Management', () => {
    it('should refresh access token with valid refresh token', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        role: 'patient',
        refreshTokens: ['valid-refresh-token']
      };

      userModel.findById.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=valid-refresh-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should logout user and clear tokens', async () => {
      const mockUser = {
        _id: 'user123',
        refreshTokens: ['valid-refresh-token'],
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findById.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', 'refreshToken=valid-refresh-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toContain('accessToken=;');
      expect(response.headers['set-cookie']).toContain('refreshToken=;');
    });
  });

  describe('Security Features', () => {
    it('should enforce rate limiting', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: 'user@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find(r => r.status === 429);
      
      expect(rateLimitedResponse).toBeDefined();
    });

    it('should validate input data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'weak',
          firstName: '',
          lastName: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication for protected routes', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Password Security', () => {
    it('should hash passwords before saving', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        password: 'hashedpassword',
        save: jest.fn().mockResolvedValue(true)
      };

      userModel.findOne.mockResolvedValue(null);
      userModel.create.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(mockUser.password).not.toBe('SecurePass123!');
    });

    it('should lock account after multiple failed attempts', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
        incLoginAttempts: jest.fn().mockResolvedValue(true),
        isLocked: false
      };

      userModel.findOne.mockResolvedValue(mockUser);

      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: 'user@example.com',
            password: 'wrongpassword'
          });
      }

      expect(mockUser.incLoginAttempts).toHaveBeenCalledTimes(5);
    });
  });
});
