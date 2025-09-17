import { Patch, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBody } from '@nestjs/swagger';
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { JwtAuthGuard } from './jwt.strategy';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import('../users/users.service')

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    if (registerDto.otp) {
      return this.authService.verifyRegisterOtp(registerDto);
    }
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    if (loginDto.otp) {
      return this.authService.verifyLoginOtp(loginDto);
    }
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.sub;
    console.log('Profile lookup for userId:', userId);
    const user = await this.usersService.findById(userId);
    console.log('DB result:', user);
    if (!user) {
      return { statusCode: 404, message: 'User not found', userId };
    }
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('get-all-profiles')
  async getAllProfiles() {
    // Exclude password field from results
    const users = await this.usersService.findAll();
    return users.map(u => ({ id: u._id, email: u.email}));
  }
  @Post('otp/resend')
  async resendOtp(@Body() body: ResendOtpDto) {
    return this.authService.resendOtp(body.email, body.role);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('update-Profile')
  @ApiBody({ type: UpdateProfileDto })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, body);
  }
}
