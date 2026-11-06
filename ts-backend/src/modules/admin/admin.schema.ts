import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Admin Login Schema
 */
export const adminLoginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email('Please provide a valid email address')
      .min(1, 'Email cannot be empty'),
    password: z.string({ message: 'Password is required' }).min(1, 'Password cannot be empty'),
  }),
});

/**
 * Zod Validation Middleware
 */
export const validateAdminLoginZod = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    adminLoginSchema.parse({
      body: req.body,
    });
    next();
  } catch (error) {
    next(error); // Pass Zod error to global error handler
  }
};
