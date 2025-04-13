import { NextFunction, Request } from 'express';
import { UserRequestDto } from '../../application/user/userRequest.dto';
import { HttpResponse } from '../http';
import { ALLOW_ALL, Method, Permission } from '../permissions';

export interface AuthenticatedRequest extends Request {
  user?: UserRequestDto;
}

export const rbacUserMiddleware =
  (permissions: Permission[]) =>
  (req: AuthenticatedRequest, res: HttpResponse<Record<string, unknown>>, next: NextFunction): void => {
    const user = req?.user;
    const userRole = user?.role;
    const permissionFound = permissions.find(permission => {
      const isRoleMatch = permission.role === userRole || permission.role === ALLOW_ALL;
      const isMethodMatch = hastMethodMatched(permission, req.method as Method);
      const isUrlMatch = hasUrlMatched(permission, req);
      const byPassAuth = permission?.bypassAuth !== undefined && permission?.bypassAuth === true;

      if (isUrlMatch && isMethodMatch && byPassAuth) {
        return true;
      }

      return isRoleMatch && isMethodMatch && isUrlMatch;
    });

    if (permissionFound === undefined) {
      return handleForbiddenResponse(res);
    }

    if (permissionFound.bypassAuth === true) {
      return next();
    }

    if (!user) {
      return handleForbiddenResponse(res);
    }
    if (user?.isSuperUser === true) {
      return next();
    }

    if (permissionFound && typeof permissionFound.allowed === 'function') {
      const isAllowed = permissionFound.allowed(user, req);
      if (!isAllowed) {
        return handleForbiddenResponse(res);
      }
      return next();
    }

    if (permissionFound.allowed === true) {
      return next();
    }

    return handleForbiddenResponse(res);
  };

function hastMethodMatched(permission: Permission, reqMethod: Method): boolean {
  const isStringMethod = permission.method === reqMethod || permission.method === ALLOW_ALL;
  const isPathIncluded = Array.isArray(permission.method) && permission.method.some(method => reqMethod === method);

  return isStringMethod || isPathIncluded;
}

function hasUrlMatched(permission: Permission, req: AuthenticatedRequest): boolean {
  const isStringPath =
    typeof permission.path === 'string' && (permission.path === req.path || permission.path === ALLOW_ALL);

  const isPathIncluded = Array.isArray(permission.path) && permission.path.some(url => req.path === url);

  return isStringPath || isPathIncluded;
}

function handleForbiddenResponse(res: HttpResponse<Record<string, unknown>>): void {
  res.status(403).json({ message: 'You are not allowed for this action' });
}
