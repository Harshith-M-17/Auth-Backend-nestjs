  
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ required: false, maxLength: 80 })
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, maxLength: 80 })
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  otp?: string;

  @ApiProperty({ required: false, enum: ['user', 'admin'], default: 'user' })
  @IsString()
  role?: 'user' | 'admin';
}
