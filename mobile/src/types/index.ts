export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
    PROVIDER = 'PROVIDER',
}

export interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
}

export interface Service {
    id: number;
    name: string;
    description: string;
    category: string;
    basePrice: number;
    duration: number;
    available: boolean;
    rating: number;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface Booking {
    id: number;
    userId: number;
    serviceId: number;
    scheduledAt: string;
    status: BookingStatus;
    totalPrice: number;
    address: string;
    stripePaymentId?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
    service?: Service;
    user?: Partial<User>;
    provider?: Partial<User>;
}
