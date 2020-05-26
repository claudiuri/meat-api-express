import { User } from '../schemas/User';
import express from 'express';
import { BaseController } from './BaseController';

class UserController extends BaseController<User> {
  constructor() {
    super(User);
  }

  applyRoutes(application: express.Application) {
    application.get(this.basePath, this.findAll);
    application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
    application.post(this.basePath, this.save);
    application.put(`${this.basePath}/:id`, [this.validateId, this.replace]);
    application.delete(`${this.basePath}/:id`, [this.validateId, this.delete]);
  }
}

export const usercontroller = new UserController();
