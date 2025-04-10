import express, { Express, Request, Response, Router } from 'express';
import { Routes } from './routes';

export function createRouter() {
  const router = Router();
  // @ts-ignore
  router.get(Routes.status, (req: Request, res: Response) => res.status(200).json({ status: 'OK' }));

  return router;
}

export function createServer(router: Router): Express {
  const server = express();
  server.use(express.json());
  server.use(router);

  return server;
}
