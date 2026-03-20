import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { NotificationService } from '../services/notificationService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24-preview' as any,
});

const prisma = new PrismaClient();

const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { service: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: 'Paiement déjà effectué ou réservation annulée' });
    }

    const amountInCents = Math.round(booking.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'mad',
      metadata: { bookingId: booking.id.toString(), userId: userId.toString() },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentId: paymentIntent.id }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: booking.totalPrice
    });
  } catch (error) {
    next(error);
  }
};

const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      const booking = await prisma.booking.update({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'CONFIRMED', paidAt: new Date() },
        include: { user: true, service: true }
      });

      if (booking.user?.pushToken) {
        await NotificationService.sendPushNotification(
          booking.user.pushToken,
          'Paiement Confirmé',
          `Votre paiement pour ${booking.service.name} a été validé !`
        );
      }

    } catch (updateError: any) {
      console.error(`Error updating booking: ${updateError.message}`);
    }
  }

  res.send();
};

export {
  createPaymentIntent,
  handleWebhook,
};
