import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import errorMiddleware from './middlewares/ErrorHandler';
import { usercontroller } from './controllers/UserController';
import { restaurantController } from './controllers/RestaurantController';

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string;
    }
  }
}
global.__rootdir__ = __dirname || process.cwd();

class App {
  public express: express.Application;

  constructor() {
    this.express = express();

    this.middlewares();
    this.database();
    this.routes();
    this.erroHandler();
  }

  private middlewares(): void {
    // Sentry.init({
    //   dsn: 'https://132ba89b94ea4471bd234cb133ce0351@sentry.io/3137150',
    //   integrations: [
    //     new RewriteFrames({
    //       root: global.__rootdir__,
    //     }),
    //   ],
    // });
    this.express.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')))
    this.express.use(express.json());

    this.express.use(cors());
    this.express.use(
      Sentry.Handlers.requestHandler() as express.RequestHandler,
    );
    // this.express.use(
    //   Sentry.Handlers.errorHandler({
    //     shouldHandleError(error) {
    //       // Capture all 404 and 500 errors
    //       if (error.status === 404 || error.status === 500) {
    //         return true;
    //       }
    //       return false;
    //     },
    //   }) as express.ErrorRequestHandler,
    // );
  }

  private database(): void {
    mongoose.connect('mongodb://localhost:27017/meat-api-express', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  }

  private routes(): void {
    usercontroller.applyRoutes(this.express);
    restaurantController.applyRoutes(this.express);
  }

  private erroHandler(): void {
    this.express.use(errorMiddleware);
  }
}

export default new App().express;
