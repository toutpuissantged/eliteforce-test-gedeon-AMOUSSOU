import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/bookingService';

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await BookingService.createBooking(req.user!.id, req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    if (error.message === 'SERVICE_NOT_FOUND') {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    if (error.message === 'SERVICE_NOT_AVAILABLE') {
      return res.status(400).json({ message: 'Service non disponible' });
    }
    next(error);
  }
};

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await BookingService.getMyBookings(req.user!.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await BookingService.cancelBooking(parseInt(req.params.id), req.user!.id);
    res.json(booking);
  } catch (error: any) {
    if (error.message === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    if (error.message === 'UNAUTHORIZED_ACCESS') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    if (error.message === 'CANNOT_CANCEL_NON_PENDING_BOOKING') {
      return res.status(400).json({ message: 'Seules les réservations en attente peuvent être annulées' });
    }
    next(error);
  }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await BookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await BookingService.updateBookingStatus(parseInt(req.params.id), req.body.status);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
