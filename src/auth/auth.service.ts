import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Cooldown store for resend requests
  private otpResendCooldown: Record<string, number> = {};

  async resendOtp(email: string, role?: 'user' | 'admin') {
    const now = Date.now();
    const cooldown = 60 * 1000; // 1 minute cooldown
    if (this.otpResendCooldown[email] && now - this.otpResendCooldown[email] < cooldown) {
      throw new ConflictException('OTP resend cooldown enforced. Please wait before retrying.');
    }
    // Only allow resend if an OTP was previously generated
    if (!this.otpStore[email]) {
      throw new UnauthorizedException('No OTP request found for this email.');
    }
    // Check user type if provided
    if (role) {
      const user = await this.usersService.findByEmail(email);
      if (!user || user.role !== role) {
        throw new UnauthorizedException('Role does not match registered user');
      }
    }
    await this.sendOtp(email);
    this.otpResendCooldown[email] = now;
    return { message: 'OTP resent to email', email };
  }


  async verifyRegisterOtp(registerDto: RegisterDto) {
  const { email, otp, firstName, lastName, phone, role } = registerDto;
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    // Verify OTP
    const record = this.otpStore[email];
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    // OTP is valid, create user with all fields
  const user = await this.usersService.create({ email, firstName, lastName, phone, role });
    delete this.otpStore[email];
    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      message: 'User created and authenticated',
    };
  }

  async verifyLoginOtp(loginDto: LoginDto) {
  const { email, otp, role } = loginDto;
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Verify OTP
    const record = this.otpStore[email];
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    delete this.otpStore[email];
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      message: 'User authenticated',
      role: user.role,
    };
  }

  // In-memory OTP store (replace with Redis or DB for production)
  private otpStore: Record<string, { otp: string; expiresAt: number }> = {};

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
      // Send OTP via Gmail SMTP using Nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.OTP_EMAIL_USER,
          pass: process.env.OTP_EMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.OTP_EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}`,
      });
      // Optionally, log for debug
      console.log(`OTP sent to ${email}: ${otp}`);
  }

  async verifyOtp(email: string, otp: string) {
    const record = this.otpStore[email];
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    // OTP is valid, authenticate user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const payload = { sub: user._id, email: user.email };
    // Optionally, delete OTP after use
    delete this.otpStore[email];
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // OTP store will be added next
  async register(registerDto: RegisterDto) {
    const { email } = registerDto;
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    // Only send OTP, do not create user yet
    await this.sendOtp(email);
    return { message: 'OTP sent to email for verification', email };
  }

  async login(loginDto: LoginDto) {
    const { email, role } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email not registered');
    }
    if (role && user.role !== role) {
      throw new UnauthorizedException('Role does not match registered user');
    }
    await this.sendOtp(email);
    return { message: 'OTP sent to email for verification', email };
  }
}
