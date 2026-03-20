import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ServiceService {
  static async getAllServices(filters: any) {
    const { search, category, minPrice, maxPrice, rating } = filters;

    const where: any = { available: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }

    return prisma.service.findMany({
      where,
      orderBy: { rating: 'desc' },
    });
  }

  static async getServiceById(id: number) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error('SERVICE_NOT_FOUND');
    }

    return service;
  }

  static async createService(serviceData: any) {
    return prisma.service.create({
      data: serviceData,
    });
  }

  static async updateService(id: number, serviceData: any) {
    return prisma.service.update({
      where: { id },
      data: serviceData,
    });
  }

  static async deleteService(id: number) {
    return prisma.service.delete({
      where: { id },
    });
  }
}
