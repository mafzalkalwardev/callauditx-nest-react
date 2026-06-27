import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { InMemoryDB } from '../in-memory-db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const { email, password, name, role, companyName } = dto;
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'CLIENT';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try PostgreSQL
    try {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) throw new ConflictException('Email already registered');

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: userRole,
          client: userRole === 'CLIENT' ? {
            create: {
              companyName: companyName || `${name}'s Company`,
              balance: 0.0,
            }
          } : undefined,
        },
        include: { client: true },
      });

      return this.generateToken(user);
    } catch (e) {
      if (e instanceof ConflictException) throw e;
      
      // Fallback to InMemoryDB
      const existing = InMemoryDB.users.find(u => u.email === email);
      if (existing) throw new ConflictException('Email already registered');

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        name,
        role: userRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      InMemoryDB.users.push(newUser);

      if (userRole === 'CLIENT') {
        const newClient = {
          id: `client-profile-${Date.now()}`,
          userId: newUser.id,
          companyName: companyName || `${name}'s Company`,
          balance: 0.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        InMemoryDB.clients.push(newClient);
      }

      return this.generateToken(newUser);
    }
  }

  async login(dto: any) {
    const { email, password } = dto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { client: true },
      });

      if (!user) throw new UnauthorizedException('Invalid credentials');
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid credentials');

      return this.generateToken(user);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      
      // Fallback to InMemoryDB
      const user = InMemoryDB.users.find(u => u.email === email);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid credentials');

      // Add client profile if client
      const client = InMemoryDB.clients.find(c => c.userId === user.id);
      const userWithClient = { ...user, client };

      return this.generateToken(userWithClient);
    }
  }

  private generateToken(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      clientId: user.client?.id || null 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.client?.id || null,
        companyName: user.client?.companyName || null,
      }
    };
  }

  async validateUser(payload: any) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { client: true },
      });
    } catch (e) {
      // Fallback
      const user = InMemoryDB.users.find(u => u.id === payload.sub);
      if (user) {
        const client = InMemoryDB.clients.find(c => c.userId === user.id);
        return { ...user, client };
      }
      return null;
    }
  }
}
