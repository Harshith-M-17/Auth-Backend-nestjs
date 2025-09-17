import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        message: string;
    } | {
        message: string;
        email: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        message: string;
        role: "user" | "admin";
    } | {
        message: string;
        email: string;
    }>;
    getProfile(req: any): Promise<import("../users/user.schema").User | {
        statusCode: number;
        message: string;
        userId: any;
    }>;
    getAllProfiles(): Promise<{
        id: any;
        email: string;
    }[]>;
    resendOtp(body: ResendOtpDto): Promise<{
        message: string;
        email: string;
    }>;
    updateProfile(req: any, body: UpdateProfileDto): Promise<import("../users/user.schema").User>;
}
