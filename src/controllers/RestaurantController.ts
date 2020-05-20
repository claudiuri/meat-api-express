import { Restaurant } from '@schemas/Restaurant';
import express from 'express';
import { BaseController } from '@controllers/BaseController';

class RestaurantController extends BaseController<Restaurant> {
  constructor() {
    super(Restaurant);
  }

  findMenu = (
    req: express.Request,
    resp: express.Response,
    next: express.NextFunction,
  ) => {
    Restaurant.findById(req.params.id, '+menu')
      .then(rest => {
        if (!rest) {
          resp.status(404).json({ message: 'Restaurante não encontrado' });
        } else {
          resp.json(rest.menu);
          return next();
        }
      })
      .catch(next);
  };

  replaceMenu = (
    req: express.Request,
    resp: express.Response,
    next: express.NextFunction,
  ) => {
    Restaurant.findById(req.params.id)
      .then(rest => {
        if (!rest) {
          resp.status(404).json({ message: 'Restaurante não encontrado' });
        } else {
          rest.menu = req.body; // ARRAY de MenuItem
          return rest.save();
        }
      })
      .then(rest => {
        if (rest) {
          resp.json(rest.menu);
        }
        return next();
      })
      .catch(next);
  };

  applyRoutes(application: express.Application) {
    application.get(this.basePath, this.findAll);
    application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
    application.post(this.basePath, this.save);
    application.put(`${this.basePath}/:id`, [this.validateId, this.replace]);
    application.delete(`${this.basePath}/:id`, [this.validateId, this.delete]);

    application.get(`${this.basePath}/:id/menu`, [
      this.validateId,
      this.findMenu,
    ]);
    application.put(`${this.basePath}/:id/menu`, [
      this.validateId,
      this.replaceMenu,
    ]);
  }
}

export const restaurantController = new RestaurantController();
