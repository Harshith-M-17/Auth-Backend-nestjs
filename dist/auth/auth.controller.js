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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const resend_otp_dto_1 = require("./dto/resend-otp.dto");
const jwt_strategy_1 = require("./jwt.strategy");
const swagger_2 = require("@nestjs/swagger");
const users_service_1 = require("../users/users.service");
Promise.resolve().then(() => require('../users/users.service'));
let AuthController = class AuthController {
    constructor(authService, usersService) {
        this.authService = authService;
        this.usersService = usersService;
    }
    async register(registerDto) {
        if (registerDto.otp) {
            return this.authService.verifyRegisterOtp(registerDto);
        }
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        if (loginDto.otp) {
            return this.authService.verifyLoginOtp(loginDto);
        }
        return this.authService.login(loginDto);
    }
    async getProfile(req) {
        const userId = req.user.sub;
        console.log('Profile lookup for userId:', userId);
        const user = await this.usersService.findById(userId);
        console.log('DB result:', user);
        if (!user) {
            return { statusCode: 404, message: 'User not found', userId };
        }
        return user;
    }
    async getAllProfiles() {
        const users = await this.usersService.findAll();
        return users.map(u => ({ id: u._id, email: u.email }));
    }
    async resendOtp(body) {
        return this.authService.resendOtp(body.email, body.role);
    }
    async updateProfile(req, body) {
        const userId = req.user.sub;
        return this.usersService.updateProfile(userId, body);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_2.Post)('register'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_2.Post)('login'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_2.ApiBearerAuth)(),
    (0, common_2.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    (0, common_2.Get)('profile'),
    __param(0, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, swagger_2.ApiBearerAuth)(),
    (0, common_2.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    (0, common_2.Get)('get-all-profiles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAllProfiles", null);
__decorate([
    (0, common_2.Post)('otp/resend'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_otp_dto_1.ResendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, swagger_2.ApiBearerAuth)(),
    (0, common_2.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    (0, common_1.Put)('update-Profile'),
    (0, swagger_1.ApiBody)({ type: update_profile_dto_1.UpdateProfileDto }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_2.Request)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_2.ApiTags)('auth'),
    (0, common_2.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map