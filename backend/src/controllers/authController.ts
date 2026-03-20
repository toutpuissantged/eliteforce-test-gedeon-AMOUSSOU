import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    next(error);
  }
};

const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.getUserProfile(req.user.id);
    res.json(user);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  getMe,
  logout,
};
