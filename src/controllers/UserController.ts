import { User } from '@schemas/User';
import express from 'express';
import { BaseController } from '@controllers/BaseController';

class UserController extends BaseController<User> {
  constructor() {
    super(User);
  }

  applyRoutes(application: express.Application) {}
}

export const usercontroller = new UserController();
