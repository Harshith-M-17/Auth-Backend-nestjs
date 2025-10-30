import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'user',
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Mock sendOtp to avoid actual email sending
    jest.spyOn(authService as any, 'sendOtp').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should send OTP for new user registration', async () => {
      const registerDto = { email: 'newuser@example.com' };
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await authService.register(registerDto as any);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(result).toEqual({
        message: 'OTP sent to email for verification',
        email: registerDto.email,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = { email: 'existing@example.com' };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should send OTP for existing user login', async () => {
      const loginDto = { email: 'test@example.com' };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login(loginDto as any);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(result).toEqual({
        message: 'OTP sent to email for verification',
        email: loginDto.email,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = { email: 'notfound@example.com' };
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyLoginOtp', () => {
    it('should return access token for valid OTP', async () => {
      const loginDto = { email: 'test@example.com', otp: '123456' };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock.jwt.token');
      
      // Set up OTP in store
      (authService as any).otpStore[loginDto.email] = {
        otp: '123456',
        expiresAt: Date.now() + 100000,
      };

      const result = await authService.verifyLoginOtp(loginDto as any);

      expect(result).toHaveProperty('access_token', 'mock.jwt.token');
      expect(result).toHaveProperty('message', 'User authenticated');
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      const loginDto = { email: 'test@example.com', otp: 'wrong' };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      
      (authService as any).otpStore[loginDto.email] = {
        otp: '123456',
        expiresAt: Date.now() + 100000,
      };

      await expect(authService.verifyLoginOtp(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });
  });
});
