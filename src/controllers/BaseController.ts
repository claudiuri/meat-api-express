/* eslint-disable prettier/prettier */
import {
  Response, Request, NextFunction,
} from 'express';
import {
  Document, Model, DocumentQuery, Types,
} from 'mongoose';

export abstract class BaseController<D extends Document> {
  basePath: string;

  pageSize: number = 4

  constructor(protected CurrentModel: Model<D>) {
    this.basePath = `/${CurrentModel.collection.name}`;
  }

  protected prepareOne(query: DocumentQuery<D, D>): DocumentQuery<D, D> {
    return query;
  }

  validateId = (req: Request, resp: Response, next: NextFunction) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      resp.status(404).json({ message: 'Documento não encontrado' });
    } else {
      next();
    }
  }

  findAll = async (req: Request, resp: Response, next: NextFunction) => {
    let page = parseInt(req.query._page || 1);
    page = page > 0 ? page : 1;

    const skip = (page - 1) * this.pageSize;

    this.CurrentModel
      .count({}).exec()
      .then((count) => this.CurrentModel.find()
        .skip(skip)
        .limit(this.pageSize)
        .then(this.renderAll(resp, next, {
          page, count, pageSize: this.pageSize, url: req.url,
        })))
      .catch(next);
  }

  findById = (req: Request, resp: Response, next: NextFunction) => {
    this.prepareOne(this.CurrentModel.findById(req.params.id) as DocumentQuery<D, D>)
      .then(this.render(resp, next))
      .catch(next);
  }

  save = (req: Request, resp: Response, next: NextFunction) => {
    const document = new this.CurrentModel(req.body);
    document
      .save()
      .then(this.render(resp, next))
      .catch(next);
  }

  replace = (req: Request, resp: Response, next: NextFunction) => {
    const options = { runValidators: true, overwrite: true };
    this.CurrentModel.update({ _id: req.params.id }, req.body, options)
      .exec().then((result) => {
        if (result.n) {
          return this.CurrentModel.findById(req.params.id);
        }
        resp.status(404).json({ message: 'Documento não encontrado' });
      }).then(this.render(resp, next))
      .catch(next);
  }

  update = (req: Request, resp: Response, next: NextFunction) => {
    const options = { runValidators: true, new: true };
    this.CurrentModel.findByIdAndUpdate(req.params.id, req.body, options)
      .then(this.render(resp, next))
      .catch(next);
  }

  delete = (req: Request, resp: Response, next: NextFunction) => {
    this.CurrentModel.remove({ _id: req.params.id }).exec().then((cmdResult: any) => {
      if (cmdResult.result.n) {
        resp.send(204);
      } else {
        resp.status(404).json({ message: 'Documento não encontrado' });
      }
      return next();
    }).catch(next);
  }

  envelope(document: any): any {
    const resource = { _links: {}, ...document.toJSON() };
    resource._links.self = `${this.basePath}/${resource._id}`;
    return resource;
  }

  envelopeAll(documents: any[], options: any = {}): any {
    const resource: any = {
      _links: {
        serf: `${options.url}`,
      },
      items: documents,
    };

    if (options.page && options.count && options.pageSize) {
      if (options.page > 1) {
        resource._links.previous = `${this.basePath}?_page=${options.page - 1}`;
      }
      const remaining = options.count - (options.page * options.pageSize);
      if (remaining > 0) {
        resource._links.next = `${this.basePath}?_page=${options.page + 1}`;
      }
    }

    return resource;
  }

  render(response: Response, next: NextFunction) {
    return (document: any) => {
      if (document) {
        if (document.password) {
          document.password = undefined;
        }
        response.json(this.envelope(document));
      } else {
        response.status(404).json({ message: 'Documento não encontrado' });
      }
      return next(false);
    };
  }

  renderAll(response: Response, next: NextFunction, options: any = {}) {
    return (documents: any[]) => {
      if (documents) {
        documents.forEach((document, index, array) => {
          if (document.password) {
            document.password = undefined;
          }
          array[index] = this.envelope(document);
        });
        response.json(this.envelopeAll(documents, options));
      } else {
        response.json(this.envelopeAll([], options));
      }
      return next(false);
    };
  }
}
