import { createRouter, createServer } from './server';

export class Factory {
  static createServer() {
    const router = createRouter();
    return createServer(router);
  }
}
