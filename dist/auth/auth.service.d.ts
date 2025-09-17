import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    private otpResendCooldown;
    resendOtp(email: string, role?: 'user' | 'admin'): Promise<{
        message: string;
        email: string;
    }>;
    verifyRegisterOtp(registerDto: RegisterDto): Promise<{
        access_token: string;
        message: string;
    }>;
    verifyLoginOtp(loginDto: LoginDto): Promise<{
        access_token: string;
        message: string;
        role: "user" | "admin";
    }>;
    private otpStore;
    sendOtp(email: string): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<{
        access_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        email: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        email: string;
    }>;
}
