import { Routes } from '../routes';
import { Request, Response } from 'express';
import { AbstractFactory, RouterCreator } from './AbstractFactory';

export class HealthFactory extends AbstractFactory {
  public static createRouter(createRouter: RouterCreator) {
    const router = createRouter();
    router.get(Routes.status, this.requestHandler);

    return router;
  }

  private static requestHandler(req: Request, res: Response) {
    res.status(200).json({ status: 'OK' });
  }
}
