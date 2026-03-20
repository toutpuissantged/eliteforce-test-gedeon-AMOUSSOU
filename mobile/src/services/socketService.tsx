import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/store';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { useModal } from './modalService';
import { addNotification } from '../store/notificationSlice';

interface SocketContextType {
  socket: Socket | null;
  joinBookingRoom: (bookingId: number | string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  joinBookingRoom: () => { },
});

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const { showModal } = useModal();

  useEffect(() => {
    let newSocket: Socket | null = null;

    if (isAuthenticated && token) {
      newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      newSocket.on('mission-completed', (data: { bookingId: number | string }) => {
        const title = 'Mission terminée';
        const body = `La mission pour la réservation #${data.bookingId} est terminée. N'oubliez pas de noter votre prestataire !`;
        
        // Add to notification history
        dispatch(addNotification({
            id: `socket-${Date.now()}`,
            title,
            body,
            data: data
        }));

        showModal({
          title,
          message: body,
          type: 'success'
        });
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, token, SOCKET_URL, showModal, dispatch]);

  const joinBookingRoom = (bookingId: number | string) => {
    if (socket) {
      socket.emit('join-booking-room', bookingId);
      console.log(`Joined room for booking ${bookingId}`);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinBookingRoom }}>
      {children}
    </SocketContext.Provider>
  );
};
