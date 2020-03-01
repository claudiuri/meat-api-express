/* eslint-disable no-restricted-syntax */
/* eslint-disable prettier/prettier */
/* eslint-disable object-curly-newline */
import { Request, Response, NextFunction } from 'express';

class HttpException extends Error {
  status: number;

  message: string;

  errors:Object;

  code: number

  // toJson:any;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export default function(
  error: HttpException,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  switch (error.name) {
    case 'MongoError':
      if (error.code === 11000) {
        error.status = 400;
      }

      break;
    case 'ValidationError':
      // eslint-disable-next-line no-case-declarations
      const messages:Array<string> = [];

      // eslint-disable-next-line no-restricted-syntax
      // eslint-disable-next-line guard-for-in
      for (const name in error.errors) {
        messages.push({ erroMessage: error.errors[name].message });
      }

      error.toJSON = () => ({
        message: 'Validation error while processing your request',
        errors: messages,
      });

      break;

    default:
      break;
  }

  response.status(400).send(error);
}
