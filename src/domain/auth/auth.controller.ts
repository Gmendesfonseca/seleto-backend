import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Logger,
  Req,
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
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly service: AuthServiceInterface) {}

  @Post('signin')
  @Authorized()
  @HttpCode(HttpStatus.OK)
  async signIn(@Body(ValidationPipe) { username, password }: SignInDto) {
    this.logger.debug('SignIn: called', { username });
    return this.service.signIn(username, password);
  }

  @Post('signup')
  @Authorized()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body(ValidationPipe) { password, username }: SignUpDto) {
    this.logger.debug('SignUp: called', { username });
    await this.service.signUp(username, password);
  }

  @Patch('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body(ValidationPipe) { email }: ForgotPasswordDto) {
    await this.service.forgotPassword(email);
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async checkSecretKey(@Body(ValidationPipe) { secretKey }: CheckSecretKeyDto) {
    await this.service.checkSecretKey(secretKey);
  }

  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(ValidationPipe) { secretKey, newPassword }: ResetPasswordDto) {
    await this.service.resetPassword(secretKey, newPassword);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body(ValidationPipe) { refreshToken }: RefreshTokenDto) {
    return this.service.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorized()
  async logout(@Req() request: any) {
    this.logger.debug('Logout: called');
    const userId = request.user?.sub;
    if (userId) {
      await this.service.logout(userId);
    }
  }
}
