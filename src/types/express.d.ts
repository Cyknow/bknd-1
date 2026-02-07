import { IUser } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user: IUser; // Now TS knows req.user exists and has name, email, etc.
    }
  }
}