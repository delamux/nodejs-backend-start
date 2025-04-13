import { createServer } from './server';
import { HealthFactory } from './factories/HealthFactory';
import { createRouter } from './router';
import { Express } from 'express';
import { WelcomeFactory } from './factories/WelcomeFactory';

export class AppFactory {
  static createServer(): Express {
    const router = createRouter();
    router.use(WelcomeFactory.createRouter(createRouter));
    router.use(HealthFactory.createRouter(createRouter));

    return createServer(router);
  }
}
