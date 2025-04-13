import { Routes } from '../routes';
import { Request, Response, Router } from 'express';
import { AbstractFactory, RouterCreator } from './AbstractFactory';

export class WelcomeFactory extends AbstractFactory {
  public static createRouter(createRouter: RouterCreator): Router {
    const router = createRouter();
    router.get(Routes.welcome, this.requestHandler);

    return router;
  }

  private static requestHandler(req: Request, res: Response): void {
    res.status(200).json({ status: 'OK', message: 'Welcome Request' });
  }
}
