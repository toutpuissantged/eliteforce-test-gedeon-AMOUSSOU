import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

import { errorHandler } from './middleware/error';
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import setupSocket from './socket';
import { swaggerUi, specs } from './docs/swagger';

const app = express();
const server = http.createServer(app);

// Setup Socket.io
setupSocket(server);

// Security Middlewares
app.use(helmet());

// Configure strictly for production, allowing only expected mobile clients
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:19000', 'http://localhost:8081', 'exp://localhost:8081'];

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Specific rate limit for login
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per `window`
  message: 'Too many login attempts from this IP, please try again after an hour',
});
app.use('/api/auth/login', loginLimiter);

// The Stripe webhook route needs the raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Regular JSON body parser for other routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', (req: Request, res: Response) => {
  res.send(swaggerUi.generateHTML(specs));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Function to get local IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const HOST = getLocalIP();

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on:`);
  console.log(`  - Local:    http://localhost:${PORT}`);
  console.log(`  - Network:  http://${HOST}:${PORT}`);
});