import express from 'express';
import { body, query } from 'express-validator';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { Role } from '@prisma/client';

const router = express.Router();

router.get(
  '/',
  [
    query('search').optional().isString(),
    query('category').optional().isString(),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('rating').optional().isNumeric(),
  ],
  validateRequest,
  getServices
);

router.get('/:id', getServiceById);

router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN]),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('basePrice').isNumeric().withMessage('Base price must be a number'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    body('available').optional().isBoolean(),
  ],
  validateRequest,
  createService
);

router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN]),
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('basePrice').optional().isNumeric(),
    body('duration').optional().isNumeric(),
    body('available').optional().isBoolean(),
  ],
  validateRequest,
  updateService
);

router.delete(
  '/:id',
  authenticate,
  authorize([Role.ADMIN]),
  deleteService
);

export default router;