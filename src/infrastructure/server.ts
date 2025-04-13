import express, { Express, Router } from 'express';

export function createServer(router: Router): Express {
  const server = express();
  server.use(express.json());
  server.use(router);

  return server;
}
