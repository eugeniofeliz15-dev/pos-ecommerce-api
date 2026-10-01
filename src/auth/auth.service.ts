import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
 import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
     private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) throw new ConflictException('El correo ya está registrado');

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...registerDto, password: hashedPassword, role: 'CLIENTE' },
    });

    return this.generateToken(user);
  }

  // Método para Passport LocalStrategy
 async validateUser(email: string, pass: string): Promise<any> {
  const user = await this.usersService.findByEmail(email);
  
  if (user && await bcrypt.compare(pass, user.password)) {
    // Verificar que el usuario no esté eliminado
    if (user.deletedAt) {
      throw new UnauthorizedException('Usuario inactivo o eliminado');
    }
    const { password, ...result } = user;
    return result;
  }
  return null;
}

  // Método actualizado para recibir el usuario desde el Guard
  async login(user: any) {
    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION') as any,
      }),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
  
}