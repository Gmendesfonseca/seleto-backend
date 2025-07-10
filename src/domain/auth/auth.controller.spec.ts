import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthServiceInterface } from './interfaces';
import {
  SignInDto,
  SignUpDto,
  ForgotPasswordDto,
  CheckSecretKeyDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthServiceInterface>;

  // Test data
  const mockSignInResponse = {
    token: 'jwt-token-123',
    expiration: 1640995200000,
  };

  const mockSignInDto: SignInDto = {
    username: 'test@example.com',
    password: 'password123',
  };

  const mockSignUpDto: SignUpDto = {
    username: 'newuser@example.com',
    password: 'password123',
  };

  const mockForgotPasswordDto: ForgotPasswordDto = {
    email: 'test@example.com',
  };

  const mockCheckSecretKeyDto: CheckSecretKeyDto = {
    secretKey: 'secret-123',
  };

  const mockResetPasswordDto: ResetPasswordDto = {
    secretKey: 'secret-123',
    newPassword: 'newpassword123',
  };

  const mockRefreshTokenDto: RefreshTokenDto = {
    refreshToken: 'refresh-token-123',
  };

  beforeEach(async () => {
    // Create mock AuthService
    const mockAuthService = {
      signIn: jest.fn(),
      signUp: jest.fn(),
      forgotPassword: jest.fn(),
      checkSecretKey: jest.fn(),
      resetPassword: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthServiceInterface,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthServiceInterface);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AuthController);
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      // Arrange
      authService.signIn.mockResolvedValue(mockSignInResponse);

      // Act
      const result = await controller.signIn(mockSignInDto);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(
        mockSignInDto.username,
        mockSignInDto.password,
      );
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSignInResponse);
    });

    it('should handle signIn service errors', async () => {
      // Arrange
      const error = new Error('Invalid credentials');
      authService.signIn.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signIn(mockSignInDto)).rejects.toThrow('Invalid credentials');
      expect(authService.signIn).toHaveBeenCalledWith(
        mockSignInDto.username,
        mockSignInDto.password,
      );
    });
  });

  describe('signUp', () => {
    it('should successfully create a new user', async () => {
      // Arrange
      authService.signUp.mockResolvedValue(undefined);

      // Act
      const result = await controller.signUp(mockSignUpDto);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(
        mockSignUpDto.username,
        mockSignUpDto.password,
      );
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle signUp service errors', async () => {
      // Arrange
      const error = new Error('User already exists');
      authService.signUp.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signUp(mockSignUpDto)).rejects.toThrow('User already exists');
      expect(authService.signUp).toHaveBeenCalledWith(
        mockSignUpDto.username,
        mockSignUpDto.password,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should successfully initiate password reset', async () => {
      // Arrange
      authService.forgotPassword.mockResolvedValue(undefined);

      // Act
      const result = await controller.forgotPassword(mockForgotPasswordDto);

      // Assert
      expect(authService.forgotPassword).toHaveBeenCalledWith(mockForgotPasswordDto.email);
      expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle forgotPassword service errors', async () => {
      // Arrange
      const error = new Error('User not found');
      authService.forgotPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.forgotPassword(mockForgotPasswordDto)).rejects.toThrow(
        'User not found',
      );
      expect(authService.forgotPassword).toHaveBeenCalledWith(mockForgotPasswordDto.email);
    });
  });

  describe('checkSecretKey', () => {
    it('should successfully validate secret key', async () => {
      // Arrange
      authService.checkSecretKey.mockResolvedValue(true);

      // Act
      const result = await controller.checkSecretKey(mockCheckSecretKeyDto);

      // Assert
      expect(authService.checkSecretKey).toHaveBeenCalledWith(mockCheckSecretKeyDto.secretKey);
      expect(authService.checkSecretKey).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle checkSecretKey service errors', async () => {
      // Arrange
      const error = new Error('Invalid secret key');
      authService.checkSecretKey.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.checkSecretKey(mockCheckSecretKeyDto)).rejects.toThrow(
        'Invalid secret key',
      );
      expect(authService.checkSecretKey).toHaveBeenCalledWith(mockCheckSecretKeyDto.secretKey);
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      // Arrange
      authService.resetPassword.mockResolvedValue(undefined);

      // Act
      const result = await controller.resetPassword(mockResetPasswordDto);

      // Assert
      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockResetPasswordDto.secretKey,
        mockResetPasswordDto.newPassword,
      );
      expect(authService.resetPassword).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle resetPassword service errors', async () => {
      // Arrange
      const error = new Error('Invalid secret key');
      authService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        'Invalid secret key',
      );
      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockResetPasswordDto.secretKey,
        mockResetPasswordDto.newPassword,
      );
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Arrange
      const mockRefreshResponse = {
        token: 'new-jwt-token-456',
        expiration: 1640998800000,
      };
      authService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const result = await controller.refreshToken(mockRefreshTokenDto);

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshTokenDto.refreshToken);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRefreshResponse);
    });

    it('should handle refreshToken service errors', async () => {
      // Arrange
      const error = new Error('Invalid refresh token');
      authService.refreshToken.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.refreshToken(mockRefreshTokenDto)).rejects.toThrow(
        'Invalid refresh token',
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshTokenDto.refreshToken);
    });
  });

  describe('DTO Validation', () => {
    it('should properly pass DTOs to service methods', async () => {
      // Arrange
      authService.signIn.mockResolvedValue(mockSignInResponse);
      authService.signUp.mockResolvedValue(undefined);
      authService.forgotPassword.mockResolvedValue(undefined);
      authService.checkSecretKey.mockResolvedValue(true);
      authService.resetPassword.mockResolvedValue(undefined);
      authService.refreshToken.mockResolvedValue(mockSignInResponse);

      // Act & Assert - Test that DTOs are properly destructured
      await controller.signIn(mockSignInDto);
      expect(authService.signIn).toHaveBeenCalledWith(
        mockSignInDto.username,
        mockSignInDto.password,
      );

      await controller.signUp(mockSignUpDto);
      expect(authService.signUp).toHaveBeenCalledWith(
        mockSignUpDto.username,
        mockSignUpDto.password,
      );

      await controller.forgotPassword(mockForgotPasswordDto);
      expect(authService.forgotPassword).toHaveBeenCalledWith(mockForgotPasswordDto.email);

      await controller.checkSecretKey(mockCheckSecretKeyDto);
      expect(authService.checkSecretKey).toHaveBeenCalledWith(mockCheckSecretKeyDto.secretKey);

      await controller.resetPassword(mockResetPasswordDto);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockResetPasswordDto.secretKey,
        mockResetPasswordDto.newPassword,
      );

      await controller.refreshToken(mockRefreshTokenDto);
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshTokenDto.refreshToken);
    });
  });
});
