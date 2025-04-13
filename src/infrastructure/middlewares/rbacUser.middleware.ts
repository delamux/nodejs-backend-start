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
  ALL = ALLOW_ALL,
  ADMIN = 'admin',
  USER = 'user',
}

export type Permission = {
  role: UserRoles;
  baseUrl: Routes;
  method: Method;
  action?: string | undefined;
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

    const permission = permissions.find(perm => {
      const isRoleMatch = perm.role === role || perm.role === ALLOW_ALL;
      const isMethodMatch = perm.method === req.method || perm.method === ALLOW_ALL;
      const isUrlMatch =
        (typeof perm.baseUrl === 'string' && (perm.baseUrl === req.baseUrl || perm.baseUrl === ALLOW_ALL)) ||
        (Array.isArray(perm.baseUrl) && perm.baseUrl.some(url => req.baseUrl === url));
      const isActionMatch = perm?.action === req.path || perm?.action === ALLOW_ALL || perm?.action === undefined;

      return isRoleMatch && isMethodMatch && isUrlMatch && isActionMatch;
    });

    if (permission === undefined) {
      return handleForbiddenResponse(res);
    }

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
