import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt.strategy';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyRegisterOtp: jest.fn(),
    verifyLoginOtp: jest.fn(),
    resendOtp: jest.fn(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should send OTP for registration', async () => {
      const registerDto = { email: 'test@example.com' };
      const expectedResult = { message: 'OTP sent to email for verification', email: 'test@example.com' };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await authController.register(registerDto as any);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('should verify OTP and create user', async () => {
      const registerDto = { email: 'test@example.com', otp: '123456' };
      const expectedResult = { access_token: 'mock.jwt.token', message: 'User created and authenticated' };
      mockAuthService.verifyRegisterOtp.mockResolvedValue(expectedResult);

      const result = await authController.register(registerDto as any);

      expect(mockAuthService.verifyRegisterOtp).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should send OTP for login', async () => {
      const loginDto = { email: 'test@example.com' };
      const expectedResult = { message: 'OTP sent to email for verification', email: 'test@example.com' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should verify OTP and return access token', async () => {
      const loginDto = { email: 'test@example.com', otp: '123456' };
      const expectedResult = { access_token: 'mock.jwt.token', message: 'User authenticated' };
      mockAuthService.verifyLoginOtp.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto as any);

      expect(mockAuthService.verifyLoginOtp).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = {
        user: { sub: '12345', email: 'test@example.com' },
      };
      const mockUser = { _id: '12345', email: 'test@example.com' };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await authController.getProfile(mockRequest);

      expect(mockUsersService.findById).toHaveBeenCalledWith('12345');
      expect(result).toEqual(mockUser);
    });

    it('should return 404 if user not found', async () => {
      const mockRequest = {
        user: { sub: '12345', email: 'test@example.com' },
      };
      mockUsersService.findById.mockResolvedValue(null);

      const result = await authController.getProfile(mockRequest);

      expect(result).toEqual({ statusCode: 404, message: 'User not found', userId: '12345' });
    });
  });

  describe('getAllProfiles', () => {
    it('should return all user profiles', async () => {
      const mockUsers = [
        { _id: '1', email: 'user1@example.com' },
        { _id: '2', email: 'user2@example.com' },
      ];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await authController.getAllProfiles();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ]);
    });
  });
});
