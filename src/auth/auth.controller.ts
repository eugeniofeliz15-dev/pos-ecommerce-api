import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'Registro de cliente',
        value: { email: 'nuevo@demo.com', password: 'Cliente123!', firstName: 'María', lastName: 'González', phone: '8095551234' }
      }
    }
  })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({
    type: LoginDto,
    examples: {
      admin: { summary: 'Admin', value: { email: 'admin@demo.com', password: 'Admin123!' } },
      cliente: { summary: 'Cliente', value: { email: 'cliente@demo.com', password: 'Client123!' } },
      cajero: { summary: 'Cajero', value: { email: 'cajero@demo.com', password: 'Cajero123!' } }
    }
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: any) {
    return this.authService.login(req.user);
  }
}