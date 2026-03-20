import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthService {
  private static generateToken(user: { id: number; email: string; role: string }) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );
  }

  static async register(userData: any) {
    const { firstName, lastName, email, password, phone, pushToken } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        pushToken,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        pushToken: true,
        role: true,
        createdAt: true,
      }
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login(credentials: any) {
    const { email, password, pushToken } = credentials;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (pushToken && user.pushToken !== pushToken) {
      await prisma.user.update({
        where: { id: user.id },
        data: { pushToken }
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = this.generateToken(user);

    return { user: { ...userWithoutPassword, pushToken }, token };
  }

  static async getUserProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        pushToken: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  }
}
