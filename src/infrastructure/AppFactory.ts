import { createServer } from './server';
import { HealthFactory } from './factories/HealthFactory';
import { createRouter } from './router';

export class AppFactory {
  static createServer() {
    const router = createRouter();
    router.use(HealthFactory.createRouter(createRouter));

    return createServer(router);
  }
}
