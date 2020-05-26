import express from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import { Restaurant } from '../schemas/Restaurant';
import { BaseController } from './BaseController';

class RestaurantController extends BaseController<Restaurant> {
	
	constructor() {
		super(Restaurant);
	}

	findMenu = (req: express.Request, resp: express.Response, next: express.NextFunction) => {
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

	replaceMenu = (req: express.Request, resp: express.Response, next: express.NextFunction) => {
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

	findAllRestaurants = async (req: express.Request, resp: express.Response, next: express.NextFunction) => {
		
		const { _page, long, lat } = req.query;
		
		let page = _page && typeof _page == 'string' ? parseInt(_page) : 1;

		const skip = (page - 1) * this.pageSize;
	
		if (lat && long) {
			Restaurant
				.countDocuments({}).exec()
				.then((count) => Restaurant.find({
					location: {
						$near: {
							$maxDistance: 1000000, // 1 Km
							$geometry: {
								type: 'Point',
								coordinates: [long, lat],
							},
						},
					},
				}).find()
					.skip(skip)
					.limit(this.pageSize)
					.then(this.renderAll(resp, next, {
						page, count, pageSize: this.pageSize, url: req.url,
					})))
				.catch(next);
		} else {
			Restaurant
				.countDocuments({}).exec()
				.then((count) => Restaurant.find()
					.skip(skip)
					.limit(this.pageSize)
					.then(this.renderAll(resp, next, {
						page, count, pageSize: this.pageSize, url: req.url,
					})))
				.catch(next);
		}
	};

	saveRestaurant = async (req: express.Request, resp: express.Response, next: express.NextFunction) => { 

		const { filename } = req.file;

		const { name, coordinates, menu, labels } = req.body;
		

		Restaurant.create({
			name, 
			location: {
				type: 'Point',
				coordinates: coordinates.split(',').map((coordinate:String)  => parseFloat(coordinate.trim()))
			},
			menu,
			labels: labels.split(',').map((label:String)  => label.trim()),
			thumbnail: filename,
		})
		.then(this.render(resp, next))
		.catch(next);
	};

	applyRoutes(application: express.Application) {

		const upload = multer(uploadConfig);

		application.get(this.basePath, this.findAllRestaurants);
		application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
		application.post(this.basePath, upload.single('thumbnail'),this.saveRestaurant);
		application.put(`${this.basePath}/:id`, [this.validateId, this.replace]);
		application.delete(`${this.basePath}/:id`, [this.validateId, this.delete]);

		// Menu
		application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu]);
		application.put(`${this.basePath}/:id/menu`, [this.validateId, this.replaceMenu]);
	}
}

export const restaurantController = new RestaurantController();
