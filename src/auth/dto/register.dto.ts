  
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ required: false, maxLength: 80 })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, maxLength: 80 })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otp?: string;

  @ApiProperty({ required: false, enum: ['user', 'admin'], default: 'user' })
  @IsOptional()
  @IsString()
  role?: 'user' | 'admin';
}
