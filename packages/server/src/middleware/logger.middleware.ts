import { NextFunction, Request, Response } from 'express';

function loggerMiddleware(request: Request, response: Response, next: NextFunction) {
  next();
}

export default loggerMiddleware;
