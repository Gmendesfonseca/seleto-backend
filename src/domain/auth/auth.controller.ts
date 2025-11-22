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
import { Public } from 'src/shared/decorators/authorization.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly service: AuthServiceInterface) {}

  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  async signIn(@Body(ValidationPipe) signInDto: SignInDto) {
    this.logger.debug('SignIn: called', { signInDto });
    const result = await this.service.signIn(signInDto.email, signInDto.password);
    return result;
  }

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body(ValidationPipe) input: SignUpDto) {
    this.logger.debug('SignUp: called', { input });
    await this.service.signUp(input);
  }

  @Patch('password')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async checkSecretKey(@Body(ValidationPipe) { secretKey }: CheckSecretKeyDto) {
    await this.service.checkSecretKey(secretKey);
  }

  @Patch('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body(ValidationPipe) { email }: ForgotPasswordDto) {
    await this.service.forgotPassword(email);
  }

  @Patch('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(ValidationPipe) { secretKey, newPassword }: ResetPasswordDto) {
    await this.service.resetPassword(secretKey, newPassword);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body(ValidationPipe) { refreshToken }: RefreshTokenDto) {
    return this.service.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: any) {
    this.logger.debug('Logout: called');
    const userId = request.auth?.sub;
    if (userId) {
      await this.service.logout(userId);
    }
  }
}
