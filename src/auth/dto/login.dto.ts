import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otp?: string;

  @ApiProperty({ required: false, enum: ['user', 'admin'] })
  @IsOptional()
  @IsString()
  role?: 'user' | 'admin';
}
