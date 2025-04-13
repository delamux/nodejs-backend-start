import { NextFunction, Request } from 'express';
import { UserRequestDto } from '../../application/user/userRequest.dto';
import { HttpResponse } from '../http';
import { Routes } from '../routes';

const ALLOW_ALL = '*';

export enum Method {
  ALL = ALLOW_ALL,
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
}

export type Permission = {
  role: UserRoles;
  path: Routes;
  method: Method;
  allowed: boolean | ((user: UserRequestDto, request: Request) => boolean);
};

export interface AuthenticatedRequest extends Request {
  user?: UserRequestDto;
}

export const rbacUserMiddleware =
  (permissions: Permission[]) =>
  (
    req: AuthenticatedRequest,
    res: HttpResponse<Record<string, unknown>>,
    next: NextFunction
  ): HttpResponse<Record<string, unknown>> | void => {
    const user = req?.user;
    if (!user) {
      return handleForbiddenResponse(res);
    }
    if (user?.isSuperUser === true) {
      return next();
    }
    const role = user.role;

    const permission = permissions.find(
      perm =>
        (perm.role === role || perm.role === UserRoles.ADMIN) &&
        (perm.method === req.method.toLowerCase() || perm.method === Method.ALL) &&
        (perm.path === req.path || perm.path === ALLOW_ALL)
    );

    if (permission && typeof permission.allowed === 'function') {
      const isAllowed = permission.allowed(user, req);
      if (!isAllowed) {
        return handleForbiddenResponse(res);
      }
      return next();
    }

    if (permission.allowed === true) {
      return next();
    }

    return handleForbiddenResponse(res);
  };

function handleForbiddenResponse(res: HttpResponse<Record<string, unknown>>): HttpResponse<Record<string, unknown>> {
  return res.status(403).json({ message: 'Forbidden' });
}
