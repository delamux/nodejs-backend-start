import { describe, it, expect, vi } from 'vitest';
import { Routes } from '../../../../infrastructure/routes';
import { NextFunction, type Request } from 'express';
import { UserRequestDto } from '../../../../application/user/userRequest.dto';
import { HttpResponse } from '../../../../infrastructure/http';
/*
 * IMPORTANT:
 * This is an example configuration file. Copy this file into your config directory and edit to
 * setup your app permissions.
 *
 * This is a quick roles-permissions implementation
 * Rules are evaluated top-down, first matching rule will apply
 * Each line define
 *      [
 *          'role' => 'role' | ['roles'] | '*'
 *          'path' => 'Controller' | ['Controllers'] | '*',
 *          'method' => 'get' | ['Controllers'] | '*',
 *          'action' => 'action' | ['actions'] | '*',
 *          'allowed' => true | false | callback (default = true)
 *      ]
 * You could use '*' to match anything
 * 'allowed' will be considered true if not defined. It allows a callable to manage complex
 * permissions, like this
 * 'allowed' => function (array $user, $role, Request $request) {}
 *
 * Example, using allowed callable to define permissions only for
 */
const ALLOW_ALL = '*';

enum Method {
  ALL = ALLOW_ALL,
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
}

type Permission = {
  role: UserRoles;
  path: Routes;
  method: Method;
  allowed: boolean | ((user: UserRequestDto, role: UserRoles, request: Request) => boolean);
};

interface AuthenticatedRequest extends Request {
  user?: UserRequestDto;
}

const rbacUserMiddleware =
  (permissions: Permission[]) =>
  (
    req: AuthenticatedRequest,
    res: HttpResponse<Record<string, unknown>>,
    next: NextFunction
  ): HttpResponse<Record<string, unknown>> | void => {
    const user = req?.user;
    if (!user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const role = user.role;

    const permission = permissions.find(
      perm =>
        (perm.role === role || perm.role === UserRoles.ADMIN) &&
        (perm.path === req.path || perm.path === ALLOW_ALL) &&
        (perm.method === req.method.toLowerCase() || perm.method === Method.ALL)
    );

    if (permission && permission.allowed) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  };

describe('rbacUserMiddleware test', () => {
  it('should return Forbidden message for not existing user on request', () => {
    const permissions: Permission[] = [{ role: UserRoles.USER, method: Method.GET, path: '/test', allowed: true }];

    const req = {
      path: '/test',
      method: 'GET',
    } as AuthenticatedRequest;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();

    const res = {
      status,
      json,
    } as unknown as HttpResponse<Record<string, unknown>>;

    const next = vi.fn() as NextFunction;

    const middleware = rbacUserMiddleware(permissions);
    middleware(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });
});
