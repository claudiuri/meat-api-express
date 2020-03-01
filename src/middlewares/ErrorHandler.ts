/* eslint-disable prettier/prettier */
/* eslint-disable object-curly-newline */
import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

export default function (
  err: ErrorRequestHandler,
  req: Request,
  resp: Response,
  next: NextFunction,
): any {
  console.log(err);
  return resp.send();
}
