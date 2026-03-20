import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  authenticate,
  [
    body('serviceId').isNumeric().withMessage('Service ID must be a number'),
    body('scheduledAt').isISO8601().withMessage('Scheduled At must be a valid ISO 8601 date'),
    body('address').trim().escape().notEmpty().withMessage('Address is required'),
  ],
  validateRequest,
  createBooking
);

router.get('/me', authenticate, getMyBookings);

router.put('/:id/cancel', authenticate, cancelBooking);

router.get('/', authenticate, authorize([Role.ADMIN]), getAllBookings);

router.put('/:id/status', authenticate, authorize([Role.ADMIN, Role.PROVIDER]), updateBookingStatus);

export default router;