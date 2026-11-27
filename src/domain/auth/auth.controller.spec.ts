import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthServiceInterface, SignInResponse, SignUpDto } from './interfaces';
import {
  SignInDto,
  ForgotPasswordDto,
  CheckSecretKeyDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto';
import { SECURED_KEY, UserType } from 'src/shared/utils/constants';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthServiceInterface>;

  const signInResponse: SignInResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    user: {
      id: 'user-1',
      username: 'jane',
      email: 'jane@example.com',
      type: 'PERSON',
      profileId: 'person-1',
      status: 'ACTIVE',
    },
  };

  const signInDto: SignInDto = { email: 'jane@example.com', password: 'test-password' };

  const signUpDto: SignUpDto = {
    username: 'jane',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'test-password',
    type: UserType.PERSON,
    cpf: '12345678901',
    phone: '+5511999999999',
  };

  const forgotPasswordDto: ForgotPasswordDto = { email: 'jane@example.com' };
  const checkSecretKeyDto: CheckSecretKeyDto = { secretKey: 'secret-123' };
  const resetPasswordDto: ResetPasswordDto = {
    secretKey: 'secret-123',
    newPassword: 'new-test-password',
  };
  const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refresh-token' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthServiceInterface,
          useValue: {
            signIn: jest.fn(),
            signUp: jest.fn(),
            forgotPassword: jest.fn(),
            checkSecretKey: jest.fn(),
            resetPassword: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthServiceInterface);
  });

  describe('signIn', () => {
    it('authenticates with the email and password and returns the tokens', async () => {
      authService.signIn.mockResolvedValue(signInResponse);

      await expect(controller.signIn(signInDto)).resolves.toEqual(signInResponse);

      expect(authService.signIn).toHaveBeenCalledWith('jane@example.com', 'test-password');
    });

    it('propagates authentication failures', async () => {
      authService.signIn.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.signIn(signInDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('forwards the whole sign-up payload and returns nothing', async () => {
      authService.signUp.mockResolvedValue(undefined);

      await expect(controller.signUp(signUpDto)).resolves.toBeUndefined();

      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('propagates conflicts', async () => {
      authService.signUp.mockRejectedValue(new Error('User already exists'));

      await expect(controller.signUp(signUpDto)).rejects.toThrow('User already exists');
    });
  });

  describe('forgotPassword', () => {
    it('requests a reset for the email', async () => {
      authService.forgotPassword.mockResolvedValue(undefined);

      await expect(controller.forgotPassword(forgotPasswordDto)).resolves.toBeUndefined();

      expect(authService.forgotPassword).toHaveBeenCalledWith('jane@example.com');
    });

    it('propagates unknown users', async () => {
      authService.forgotPassword.mockRejectedValue(new Error('User not found'));

      await expect(controller.forgotPassword(forgotPasswordDto)).rejects.toThrow('User not found');
    });
  });

  describe('checkSecretKey', () => {
    it('validates the secret key and returns nothing', async () => {
      authService.checkSecretKey.mockResolvedValue(true);

      await expect(controller.checkSecretKey(checkSecretKeyDto)).resolves.toBeUndefined();

      expect(authService.checkSecretKey).toHaveBeenCalledWith('secret-123');
    });

    it('propagates invalid keys', async () => {
      authService.checkSecretKey.mockRejectedValue(new Error('Invalid secret key'));

      await expect(controller.checkSecretKey(checkSecretKeyDto)).rejects.toThrow(
        'Invalid secret key',
      );
    });
  });

  describe('resetPassword', () => {
    it('resets the password with the secret key and the new password', async () => {
      authService.resetPassword.mockResolvedValue(undefined);

      await expect(controller.resetPassword(resetPasswordDto)).resolves.toBeUndefined();

      expect(authService.resetPassword).toHaveBeenCalledWith('secret-123', 'new-test-password');
    });

    it('propagates invalid keys', async () => {
      authService.resetPassword.mockRejectedValue(new Error('Invalid secret key'));

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Invalid secret key',
      );
    });
  });

  describe('refreshToken', () => {
    it('exchanges the refresh token for a new session', async () => {
      authService.refreshToken.mockResolvedValue(signInResponse);

      await expect(controller.refreshToken(refreshTokenDto)).resolves.toEqual(signInResponse);

      expect(authService.refreshToken).toHaveBeenCalledWith('refresh-token');
    });

    it('propagates invalid refresh tokens', async () => {
      authService.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('logout', () => {
    it('logs out the user stored on the authenticated request', async () => {
      authService.logout.mockResolvedValue(undefined);

      await controller.logout({ auth: { sub: 'user-1' } });

      expect(authService.logout).toHaveBeenCalledWith('user-1');
    });

    it('does nothing when the request carries no authenticated user', async () => {
      await controller.logout({});

      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('route access', () => {
    const isPublic = (handler: keyof AuthController) =>
      Reflect.getMetadata(SECURED_KEY, AuthController.prototype[handler]);

    it.each([
      'signIn',
      'signUp',
      'checkSecretKey',
      'forgotPassword',
      'resetPassword',
      'refreshToken',
    ] as const)('keeps %s reachable without a token', (handler) => {
      expect(isPublic(handler)).toBe(true);
    });

    it('requires a token to log out', () => {
      expect(isPublic('logout')).toBeUndefined();
    });
  });
});
