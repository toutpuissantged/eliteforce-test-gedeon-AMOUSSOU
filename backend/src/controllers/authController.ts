import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

const generateToken = (user: UserPayload) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, phone, pushToken } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
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

    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, pushToken } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update push token on login if provided
    if (pushToken && user.pushToken !== pushToken) {
      await prisma.user.update({
        where: { id: user.id },
        data: { pushToken }
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user);

    res.json({ user: { ...userWithoutPassword, pushToken }, token });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For JWT, actual logout is usually handled client-side by deleting the token.
    // However, providing a successful response confirms the request.
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  getMe,
  logout,
};