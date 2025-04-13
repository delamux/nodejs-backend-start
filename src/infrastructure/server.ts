import express, { Express, Router } from 'express';
import { rbacUserMiddleware } from './middlewares/rbacUser.middleware';
import { permissions } from './permissions';

export function createServer(router: Router): Express {
  const server = express();
  server.use(express.json());
  server.use(rbacUserMiddleware(permissions));
  server.use(router);

  return server;
}
