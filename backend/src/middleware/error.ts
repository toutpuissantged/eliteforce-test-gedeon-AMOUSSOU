import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Une erreur interne est survenue';
  let errors: any = null;

  // Handle Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 400;
      message = 'Une contrainte d\'unicité a été violée';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Ressource non trouvée';
    }
  }

  // Handle Validation Errors (express-validator)
  if (err.errors && Array.isArray(err.errors)) {
    statusCode = 400;
    message = 'Erreur de validation';
    errors = err.errors;
  }

  // Log error for development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ [Error]:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  } else {
    // In production, log less detail but still enough to debug
    console.error(`❌ [${req.method}] ${req.path} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

export { errorHandler };
