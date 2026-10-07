import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input parameters',
      details: err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  // Handle malformed JSON bodies
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Malformed JSON payload in request body.'
    });
    return;
  }

  // General errors - avoid leaking internal stack traces or secrets in production
  console.error('[ServerError]', {
    message: err.message,
    name: err.name,
    path: req.originalUrl,
    method: req.method
  });

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: statusCode === 500 ? 'An unexpected server error occurred.' : err.message
  });
}
