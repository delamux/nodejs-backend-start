import { createServer } from './server';
import { HealthFactory } from './factories/HealthFactory';
import { createRouter } from './router';
import { Express } from 'express';

export class AppFactory {
  static createServer(): Express {
    const router = createRouter();
    router.use(HealthFactory.createRouter(createRouter));

    return createServer(router);
  }
}
