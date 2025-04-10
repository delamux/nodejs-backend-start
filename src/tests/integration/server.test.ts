import request from 'supertest';
import { Routes } from '../../infrastructure/routes';
import { Express } from 'express';
import { beforeEach, describe, it, expect } from 'vitest';
import { AppFactory } from '../../infrastructure/AppFactory';

describe('The Server', () => {
  let server: Express;
  beforeEach(() => {
    server = AppFactory.createServer();
  });

  it('works', async () => {
    const response = await request(server).get(Routes.status);

    expect(response.status).toEqual(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({ status: 'OK' });
  });
});
