import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear usuario (Solo Admin)' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      cajero: {
        summary: 'Crear usuario Cajero',
        value: { email: 'cajero2@demo.com', password: 'Cajero123!', firstName: 'Pedro', lastName: 'López', phone: '8095559999', role: 'CAJERO' }
      }
    }
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}