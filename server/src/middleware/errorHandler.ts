import type { NextFunction, Request, Response } from 'express';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', err);

  if (res.headersSent) {
    return;
  }

  const status = err.status ?? err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const genericMessage =
    status === 413 ? 'Request body too large' : status === 400 ? 'Invalid request body' : 'Something went wrong';

  const message = !isProduction && err.message ? err.message : genericMessage;

  res.status(status).json({ error: message });
}
