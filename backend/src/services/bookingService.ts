import { PrismaClient, BookingStatus } from '@prisma/client';
import { NotificationService } from './notificationService';

const prisma = new PrismaClient();

export class BookingService {
  static async createBooking(userId: number, bookingData: any) {
    const { serviceId, scheduledAt, address } = bookingData;

    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    });

    if (!service) {
      throw new Error('SERVICE_NOT_FOUND');
    }

    if (!service.available) {
      throw new Error('SERVICE_NOT_AVAILABLE');
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId: service.id,
        scheduledAt: new Date(scheduledAt),
        address,
        totalPrice: service.basePrice,
      },
      include: {
        service: true,
        user: true
      }
    });

    if (booking.user?.pushToken) {
      await NotificationService.sendPushNotification(
        booking.user.pushToken,
        'Réservation enregistrée',
        `Votre réservation pour ${service.name} a été créée. En attente de paiement.`
      );
    }

    return booking;
  }

  static async getMyBookings(userId: number) {
    return prisma.booking.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getBookingById(id: number) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true, user: true, provider: true }
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    return booking;
  }

  static async cancelBooking(id: number, userId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    if (booking.userId !== userId) {
      throw new Error('UNAUTHORIZED_ACCESS');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new Error('CANNOT_CANCEL_NON_PENDING_BOOKING');
    }

    return prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: { service: true }
    });
  }

  static async getAllBookings() {
    return prisma.booking.findMany({
      include: {
        service: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateBookingStatus(id: number, status: BookingStatus) {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { user: true, service: true }
    });

    if (booking.user?.pushToken) {
      let title = 'Mise à jour de réservation';
      let body = `Le statut de votre réservation pour ${booking.service.name} a changé.`;

      if (status === BookingStatus.IN_PROGRESS) {
        title = 'Prestataire en route';
        body = `Votre prestataire pour ${booking.service.name} est en route !`;
      } else if (status === BookingStatus.COMPLETED) {
        title = 'Mission terminée';
        body = `La mission pour ${booking.service.name} a été marquée comme terminée.`;
      }

      await NotificationService.sendPushNotification(booking.user.pushToken, title, body);
    }

    return booking;
  }
}
