import { createServer } from './server';
import { HealthFactory } from './factories/HealthFactory';
import { createRouter } from './router';
import { Express } from 'express';
import { WelcomeFactory } from './factories/WelcomeFactory';
import { rbacUserMiddleware } from './middlewares/rbacUser.middleware';
import { permissions } from './permissions';

export class AppFactory {
  static createServer(): Express {
    const router = createRouter();

    router.use(rbacUserMiddleware(permissions));
    router.use(WelcomeFactory.createRouter(createRouter));
    router.use(HealthFactory.createRouter(createRouter));

    return createServer(router);
  }
}
