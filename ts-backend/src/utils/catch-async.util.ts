import { Request, Response, NextFunction } from 'express';

/**
 * Catch Async - Higher Order Function
 * Wraps async route handlers to automatically catch errors and pass to Express error handler
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
