import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendPushNotification } from '../utils/notifications';

const prisma = new PrismaClient();

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId, scheduledAt, address } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (!service.available) {
      return res.status(400).json({ message: 'Service is currently not available' });
    }

    const totalPrice = service.basePrice; // Simplified pricing logic, could add extras later

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId: service.id,
        scheduledAt: new Date(scheduledAt),
        address,
        totalPrice,
      },
      include: {
        service: true,
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied: You do not own this booking' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only PENDING bookings can be cancelled' });
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
      include: { service: true }
    });

    res.json(cancelledBooking);
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { user: true, service: true }
    });

    if (booking.user?.pushToken) {
      let title = 'Mise à jour de réservation';
      let body = `Le statut de votre réservation pour ${booking.service.name} a changé.`;

      if (status === 'IN_PROGRESS') {
        title = 'Prestataire en route';
        body = `Votre prestataire pour ${booking.service.name} est en route !`;
      } else if (status === 'COMPLETED') {
        title = 'Mission terminée';
        body = `La mission pour ${booking.service.name} a été marquée comme terminée.`;
      } else if (status === 'CANCELLED') {
        title = 'Réservation annulée';
        body = `Votre réservation pour ${booking.service.name} a été annulée.`;
      }

      await sendPushNotification(booking.user.pushToken, title, body);
    }

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