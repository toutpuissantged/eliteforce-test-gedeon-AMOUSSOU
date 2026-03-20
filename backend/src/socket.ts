import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface CustomSocket extends Socket {
  user?: any;
}

const setupSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST']
    }
  });

  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: CustomSocket) => {
    console.log(`User connected: ${socket.user?.id}, Socket ID: ${socket.id}`);

    // Rejoindre la room d'une réservation spécifique
    socket.on('join-booking-room', (bookingId: string) => {
      const roomName = `booking_${bookingId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    // Événement: provider-location
    socket.on('provider-location', (data: { bookingId: string, latitude: number, longitude: number }) => {
      const { bookingId, ...location } = data;
      const roomName = `booking_${bookingId}`;

      // Broadcast location to clients in the room
      io.to(roomName).emit('provider-location', location);
    });

    socket.on('booking-status-update', (data: { bookingId: string, status: string }) => {
      const { bookingId, status } = data;
      const roomName = `booking_${bookingId}`;

      io.to(roomName).emit('booking-status-update', { bookingId, status });

      if (status === 'COMPLETED') {
        io.to(roomName).emit('mission-completed', { bookingId });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  return io;
};

export default setupSocket;