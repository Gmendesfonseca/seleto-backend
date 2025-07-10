import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AuthServiceInterface } from './interfaces';
import {
  SignInDto,
  SignUpDto,
  ForgotPasswordDto,
  CheckSecretKeyDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthServiceInterface) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body(ValidationPipe) signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body(ValidationPipe) signUpDto: SignUpDto) {
    await this.authService.signUp(signUpDto.username, signUpDto.password);
  }

  @Patch('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async checkSecretKey(@Body(ValidationPipe) checkSecretKeyDto: CheckSecretKeyDto) {
    await this.authService.checkSecretKey(checkSecretKeyDto.secretKey);
  }

  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.secretKey, resetPasswordDto.newPassword);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
