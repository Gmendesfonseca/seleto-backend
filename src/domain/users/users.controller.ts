import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  HttpCode,
  Controller,
  ParseUUIDPipe,
  ValidationPipe,
  Request,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  UpdateEmailDto,
  UpdateUsernameDto,
  ActivateUserDto,
  UpdateUserDto,
} from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UsersServiceInterface, UserFilters } from './interfaces/user.service.interface';
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly service: UsersServiceInterface) {}

  @Get()
  @HttpCode(200)
  @Authorized()
  async index(@Query(ValidationPipe) queryDto: QueryUserDto) {
    this.logger.debug('Index: Called');
    try {
      const filters: UserFilters = {
        email: queryDto.email,
        username: queryDto.username,
        status: queryDto.status,
        type: queryDto.type,
        companyId: queryDto.companyId,
        isVerified: queryDto.isVerified,
        page: queryDto.page ? Number.parseInt(queryDto.page, 10) : 1,
        limit: queryDto.limit ? Number.parseInt(queryDto.limit, 10) : 10,
      };
      return await this.service.findAll(filters);
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException('Failed to list users');
    }
  }

  @Get('/me')
  @HttpCode(200)
  @Authorized()
  async me(@Request() req: any) {
    this.logger.debug('Me: Called');
    try {
      const userId = req.auth?.id || req.user?.id;
      const model = await this.service.findById(userId);
      return {
        id: model?.id,
        email: model?.email,
        username: model?.username,
        name: model?.name,
        type: model?.type,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error instanceof NotFoundException ? error : new NotFoundException('User not found');
    }
  }

  @Get('/:id')
  @HttpCode(200)
  async show(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.debug('Show: Called');
    try {
      return await this.service.findById(id);
    } catch (error) {
      this.logger.error(error.message);
      throw error instanceof NotFoundException ? error : new NotFoundException('User not found');
    }
  }

  @Post('/')
  @HttpCode(201)
  @Authorized()
  async activate(@Body() activateUserDto: ActivateUserDto) {
    this.logger.debug('Activate: Called');
    try {
      await this.service.activate(activateUserDto);
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
    this.logger.debug('UpdateEmail: Called');
    try {
      await this.service.changeEmail({ id, email, secret });
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
    this.logger.debug('UpdateUsername: Called');
    try {
      return await this.service.updateUsername({ id, username });
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException();
    }
  }

  @Put('/:id')
  @HttpCode(200)
  @Authorized()
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    this.logger.debug('Update: Called');
    try {
      return await this.service.update(id, updateUserDto);
    } catch (error) {
      this.logger.error(error.message);
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException('Failed to update user');
    }
  }

  @Delete('/:id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.debug('Delete: Called');
    try {
      await this.service.delete(id);
    } catch (error) {
      this.logger.error(error.message);
      return new NotFoundException();
    }
  }
}
