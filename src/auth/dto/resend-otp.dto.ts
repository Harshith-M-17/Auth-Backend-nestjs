import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, enum: ['user', 'admin'] })
  @IsOptional()
  @IsString()
  role?: 'user' | 'admin';
}
