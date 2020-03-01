import { Request, Response, NextFunction } from 'express';

class HttpException extends Error {
  status: number;

  message: string;

  errors: any;

  code: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export default function(
  err: HttpException,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  let errosJson: object = {};

  switch (err.name) {
    case 'MongoError': {
      if (err.code === 11000) {
        err.status = 400;
      }

      errosJson = { message: err.message };
      break;
    }

    case 'ValidationError': {
      const messages: Array<string> = [];

      Object.keys(err.errors).forEach((key, index) => {
        messages.push(err.errors[key].message);
      });

      errosJson = {
        message: 'Validation error while processing your request',
        errors: messages,
      };
      break;
    }
    default:
      break;
  }

  response.status(400).send(errosJson);
}
