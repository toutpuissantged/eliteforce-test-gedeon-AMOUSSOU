import { Request, Response, NextFunction } from 'express';
import { ServiceService } from '../services/serviceService';

const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await ServiceService.getAllServices(req.query);
    res.json(services);
  } catch (error) {
    next(error);
  }
};

const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await ServiceService.getServiceById(parseInt(req.params.id));
    res.json(service);
  } catch (error: any) {
    if (error.message === 'SERVICE_NOT_FOUND') {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    next(error);
  }
};

const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await ServiceService.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await ServiceService.updateService(parseInt(req.params.id), req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ServiceService.deleteService(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
