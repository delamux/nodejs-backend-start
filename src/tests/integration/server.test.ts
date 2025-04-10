import request from 'supertest';
import { Routes } from '../../infrastructure/routes';
import { Factory } from '../../infrastructure/factory';
import { Express } from 'express';
import { beforeEach, describe, it, expect } from 'vitest';

describe('The Server', () => {
  let server: Express;
  beforeEach(() => {
    server = Factory.createServer();
  });

  it('works', async () => {
    const response = await request(server).get(Routes.status);

    expect(response.status).toEqual(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({ status: 'OK' });
  });
});
