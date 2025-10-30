# Auth Backend NestJS - Testing Guide

This project includes comprehensive unit and end-to-end (e2e) tests for the authentication API.

## Test Structure

```
src/
├── auth/
│   ├── auth.service.spec.ts      # Unit tests for AuthService
│   └── auth.controller.spec.ts   # Unit tests for AuthController
test/
├── auth.e2e-spec.ts               # E2E tests for Auth API
└── jest-e2e.json                  # Jest configuration for E2E tests
```

## Running Tests

### Run All Unit Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:cov
```

### Run End-to-End Tests
```bash
npm run test:e2e
```

## Test Coverage

### AuthService Tests (`auth.service.spec.ts`)
- ✅ Register: Send OTP for new user registration
- ✅ Register: Throw ConflictException if email already exists
- ✅ Login: Send OTP for existing user login
- ✅ Login: Throw UnauthorizedException if user not found
- ✅ Verify Login OTP: Return access token for valid OTP
- ✅ Verify Login OTP: Throw UnauthorizedException for invalid OTP

### AuthController Tests (`auth.controller.spec.ts`)
- ✅ Register: Send OTP for registration
- ✅ Register: Verify OTP and create user
- ✅ Login: Send OTP for login
- ✅ Login: Verify OTP and return access token
- ✅ Get Profile: Return user profile
- ✅ Get Profile: Return 404 if user not found
- ✅ Get All Profiles: Return all user profiles

### E2E Tests (`auth.e2e-spec.ts`)
- ✅ POST /auth/register - Send OTP for new user
- ✅ POST /auth/register - Verify OTP and create user
- ✅ POST /auth/register - Return 409 if email exists
- ✅ POST /auth/login - Send OTP for login
- ✅ POST /auth/login - Verify OTP and return JWT
- ✅ POST /auth/login - Return 401 for non-existent user
- ✅ GET /auth/profile - Return user profile with valid JWT
- ✅ GET /auth/profile - Return 401 without JWT
- ✅ GET /auth/profile - Return 401 with invalid JWT
- ✅ GET /auth/get-all-profiles - Return all profiles with valid JWT
- ✅ GET /auth/get-all-profiles - Return 401 without JWT

## Test Dependencies

- **Jest**: Testing framework
- **Supertest**: HTTP assertions for E2E tests
- **@nestjs/testing**: NestJS testing utilities
- **ts-jest**: TypeScript support for Jest

## Notes

- Unit tests use mocked services to test logic in isolation
- E2E tests run against a real MongoDB connection
- OTP verification is tested by accessing the internal OTP store
- Tests automatically clean up database after completion
- All tests are independent and can run in any order

## Writing New Tests

### Unit Test Example
```typescript
it('should do something', async () => {
  const result = await service.method(params);
  expect(result).toEqual(expectedValue);
});
```

### E2E Test Example
```typescript
it('should return 200 for valid request', async () => {
  await request(app.getHttpServer())
    .get('/endpoint')
    .expect(200)
    .expect((res) => {
      expect(res.body).toHaveProperty('key');
    });
});
```

## CI/CD Integration

These tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e
  env:
    MONGODB_URI: ${{ secrets.MONGODB_URI }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```
