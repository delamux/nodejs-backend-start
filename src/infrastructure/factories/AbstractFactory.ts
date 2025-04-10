import { Router } from 'express';

export type RouterCreator = () => Router;

export abstract class AbstractFactory {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createRouter(router: RouterCreator): Router {
    throw new Error('Method not implemented.');
  }
}
