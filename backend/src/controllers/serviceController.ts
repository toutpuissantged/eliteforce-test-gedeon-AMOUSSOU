import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, minPrice, maxPrice, rating } = req.query as any;

    const whereClause: Prisma.ServiceWhereInput = {};

    if (search) {
      whereClause.name = {
        contains: search as string,
        mode: 'insensitive' as Prisma.QueryMode,
      };
    }

    if (category) {
      whereClause.category = category as string;
    }

    if (minPrice || maxPrice) {
      whereClause.basePrice = {};
      if (minPrice) (whereClause.basePrice as any).gte = parseFloat(minPrice as string);
      if (maxPrice) (whereClause.basePrice as any).lte = parseFloat(maxPrice as string);
    }

    if (rating) {
      whereClause.rating = {
        gte: parseFloat(rating as string),
      };
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: { rating: 'desc' }
    });

    res.json(services);
  } catch (error) {
    next(error);
  }
};

const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    next(error);
  }
};

const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, category, basePrice, duration, available } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        category,
        basePrice: parseFloat(basePrice),
        duration: parseInt(duration),
        available: available !== undefined ? available : true,
      }
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, description, category, basePrice, duration, available } = req.body;

    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        available
      }
    });

    res.json(service);
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await prisma.service.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};