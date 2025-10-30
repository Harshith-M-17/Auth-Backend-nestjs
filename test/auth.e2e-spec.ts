import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AuthService } from '../src/auth/auth.service';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let authService: AuthService;
  let jwtToken: string;
  const testUser = {
    email: `test${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890',
    role: 'user' as 'user' | 'admin',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    // Clean up test data
    if (connection) {
      const collections = connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should send OTP for new user registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: testUser.email })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'OTP sent to email for verification');
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('should verify OTP and create user', async () => {
      // Get OTP from service (for testing purposes)
      const otpRecord = (authService as any).otpStore[testUser.email];
      expect(otpRecord).toBeDefined();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          otp: otpRecord.otp,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
          role: testUser.role,
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('message', 'User created and authenticated');
      jwtToken = response.body.access_token;
    });

    it('should return 409 if email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: testUser.email })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should send OTP for login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'OTP sent to email for verification');
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('should verify OTP and return access token', async () => {
      const otpRecord = (authService as any).otpStore[testUser.email];
      expect(otpRecord).toBeDefined();

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          otp: otpRecord.otp,
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('message', 'User authenticated');
      jwtToken = response.body.access_token;
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com' })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('_id');
    });

    it('should return 401 without JWT token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  describe('GET /auth/get-all-profiles', () => {
    it('should return all user profiles with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/get-all-profiles')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should return 401 without JWT token', async () => {
      await request(app.getHttpServer())
        .get('/auth/get-all-profiles')
        .expect(401);
    });
  });
});
