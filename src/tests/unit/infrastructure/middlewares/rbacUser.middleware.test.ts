import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextFunction } from 'express';
import { HttpResponse } from '../../../../infrastructure/http';
import { MockInstance } from '@vitest/spy';
import { AuthenticatedRequest, rbacUserMiddleware } from '../../../../infrastructure/middlewares/rbacUser.middleware';
import { Method, Permission, UserRoles } from '../../../../infrastructure/permissions';

describe('rbacUserMiddleware test', () => {
  let status: MockInstance;
  let json: MockInstance;
  let res: HttpResponse<Record<string, unknown>>;
  let next: NextFunction;
  beforeEach(() => {
    status = vi.fn().mockReturnThis();
    json = vi.fn();
    res = {
      status,
      json,
    } as unknown as HttpResponse<Record<string, unknown>>;
    next = vi.fn() as NextFunction;
  });
  it('should return Forbidden message for not existing user on request', () => {
    const permissions: Permission[] = [{ role: UserRoles.USER, method: Method.GET, baseUrl: '/test', allowed: true }];

    const req = {
      baseUrl: '/test',
      method: Method.GET,
    } as AuthenticatedRequest;

    const middleware = rbacUserMiddleware(permissions);
    middleware(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ message: 'You are not allowed for this action' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next for existing user with permission', () => {
    const testPath = '/test';
    const permissions: Permission[] = [{ role: UserRoles.USER, method: Method.GET, baseUrl: testPath, allowed: true }];
    const req = {
      baseUrl: testPath,
      method: Method.GET,
      user: {
        email: 'no-relevant',
        role: UserRoles.USER,
      },
    } as AuthenticatedRequest;

    const middleware = rbacUserMiddleware(permissions);
    middleware(req, res, next);

    expect(next).toBeCalledTimes(1);
  });

  it('should call next for existing user with permission with arrays of paths', () => {
    const testPath1 = '/test';
    const testPath2 = '/test2';
    const testPath3 = '/test3';
    const testPath4 = '/test4';
    const permissions: Permission[] = [
      { role: UserRoles.USER, method: Method.GET, baseUrl: [testPath1, testPath2, testPath3], allowed: true },
    ];
    const req = {
      baseUrl: testPath1,
      method: Method.GET,
      user: {
        email: 'no-relevant',
        role: UserRoles.USER,
      },
    } as AuthenticatedRequest;

    const middleware = rbacUserMiddleware(permissions);

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    req.baseUrl = testPath2;
    rbacUserMiddleware(permissions)(req, res, next);
    expect(next).toHaveBeenCalled();
    req.baseUrl = testPath3;
    rbacUserMiddleware(permissions)(req, res, next);
    expect(next).toHaveBeenCalled();
    // Not existed path in permissions
    req.baseUrl = testPath4;
    rbacUserMiddleware(permissions)(req, res, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ message: 'You are not allowed for this action' });
    expect(next).toBeCalledTimes(3);
  });

  it('Is super user then it will call next method', () => {
    const testPath = '/test';
    const permissions: Permission[] = [{ role: UserRoles.USER, method: Method.GET, baseUrl: testPath, allowed: true }];
    const req = {
      baseUrl: testPath,
      method: Method.GET,
      user: {
        email: 'no-relevant',
        isSuperUser: true,
      },
    } as AuthenticatedRequest;

    const middleware = rbacUserMiddleware(permissions);
    middleware(req, res, next);

    expect(next).toBeCalledTimes(1);
  });

  it('should return forbidden as Is Admin, but can not edit other user profile, should find the not allowed permissions first', () => {
    const testPath = '/test/2';
    const req = {
      baseUrl: testPath,
      method: Method.PUT,
      params: {
        id: '2',
      },
      user: {
        id: '1',
        role: UserRoles.ADMIN,
        email: 'no-relevant',
        isSuperUser: false,
      },
    } as unknown as AuthenticatedRequest;
    const permissions: Permission[] = [
      {
        role: UserRoles.ADMIN,
        method: Method.PUT,
        baseUrl: testPath,
        allowed: (user, req): boolean => {
          return user.id === req.params.id;
        },
      },
      {
        role: UserRoles.ADMIN,
        method: Method.ALL,
        baseUrl: testPath,
        allowed: true,
      },
    ];

    const middleware = rbacUserMiddleware(permissions);
    middleware(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ message: 'You are not allowed for this action' });
    expect(next).not.toHaveBeenCalled();
  });
});
