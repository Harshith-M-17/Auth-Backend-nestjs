"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const nodemailer = require("nodemailer");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.otpResendCooldown = {};
        this.otpStore = {};
    }
    async resendOtp(email, role) {
        const now = Date.now();
        const cooldown = 60 * 1000;
        if (this.otpResendCooldown[email] && now - this.otpResendCooldown[email] < cooldown) {
            throw new common_1.ConflictException('OTP resend cooldown enforced. Please wait before retrying.');
        }
        if (!this.otpStore[email]) {
            throw new common_1.UnauthorizedException('No OTP request found for this email.');
        }
        if (role) {
            const user = await this.usersService.findByEmail(email);
            if (!user || user.role !== role) {
                throw new common_1.UnauthorizedException('Role does not match registered user');
            }
        }
        await this.sendOtp(email);
        this.otpResendCooldown[email] = now;
        return { message: 'OTP resent to email', email };
    }
    async verifyRegisterOtp(registerDto) {
        const { email, otp, firstName, lastName, phone, role } = registerDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const record = this.otpStore[email];
        if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        const user = await this.usersService.create({ email, firstName, lastName, phone, role });
        delete this.otpStore[email];
        const payload = { sub: user._id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            message: 'User created and authenticated',
        };
    }
    async verifyLoginOtp(loginDto) {
        const { email, otp, role } = loginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const record = this.otpStore[email];
        if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        delete this.otpStore[email];
        const payload = { sub: user._id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            message: 'User authenticated',
            role: user.role,
        };
    }
    async sendOtp(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
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
        console.log(`OTP sent to ${email}: ${otp}`);
    }
    async verifyOtp(email, otp) {
        const record = this.otpStore[email];
        if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const payload = { sub: user._id, email: user.email };
        delete this.otpStore[email];
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async register(registerDto) {
        const { email } = registerDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        await this.sendOtp(email);
        return { message: 'OTP sent to email for verification', email };
    }
    async login(loginDto) {
        const { email, role } = loginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Email not registered');
        }
        if (role && user.role !== role) {
            throw new common_1.UnauthorizedException('Role does not match registered user');
        }
        await this.sendOtp(email);
        return { message: 'OTP sent to email for verification', email };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map