import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UpdateEmailDto, UpdateUsernameDto, ActivateUserDto } from './dto/update-user.dto';
import { UsersServiceInterface } from './interfaces/user.service.interface';
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersServiceInterface) {}

  @Get('/:id')
  @HttpCode(200)
  async getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.debug('UsersController.getUser: Called');
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      this.logger.error(error.message);
      throw error instanceof NotFoundException ? error : new NotFoundException('User not found');
    }
  }

  @Post('/')
  @HttpCode(201)
  @Authorized()
  async activateUser(@Body() activateUserDto: ActivateUserDto) {
    this.logger.debug('UsersController.activateUser: Called');
    try {
      await this.usersService.activate(activateUserDto);
      return { message: 'User activated successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException('Failed to activate user');
    }
  }

  @Put('/:id/email')
  @HttpCode(204)
  async updateEmail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { email, secret }: UpdateEmailDto,
  ) {
    this.logger.debug('UsersController.updateEmail: Called');
    try {
      await this.usersService.changeEmail({ id, email, secret });
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException();
    }
  }

  @Put('/:id/username')
  @HttpCode(204)
  async updateUsername(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { username }: UpdateUsernameDto,
  ) {
    this.logger.debug('UsersController.updateUser: Called');
    try {
      return await this.usersService.updateUsername({ id, username });
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException();
    }
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.debug('UsersController.deleteUser: Called');
    try {
      return this.usersService.delete(id);
    } catch (error) {
      this.logger.error(error.message);
      return new NotFoundException();
    }
  }
}
