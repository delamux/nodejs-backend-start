import { NextFunction, Request } from 'express';
import { UserRequestDto } from '../../application/user/userRequest.dto';
import { HttpResponse } from '../http';
import { ALLOW_ALL, Permission } from '../permissions';

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
      const isMethodMatch = permission.method === req.method || permission.method === ALLOW_ALL;
      const isUrlMatch = hasUrlMatched(permission, req);
      const byPassAuth = permission?.bypassAuth !== undefined && permission?.bypassAuth === true;

      if (isUrlMatch && isMethodMatch && byPassAuth) {
        return next();
      }

      const isActionMatch =
        permission?.action === req.path || permission?.action === ALLOW_ALL || permission?.action === undefined;

      return isRoleMatch && isMethodMatch && isUrlMatch && isActionMatch;
    });

    if (permissionFound === undefined) {
      return handleForbiddenResponse(res);
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

function hasUrlMatched(permissions: Permission, req: AuthenticatedRequest): boolean {
  const isStringPath =
    typeof permissions.path === 'string' && (permissions.path === req.path || permissions.path === ALLOW_ALL);

  const isPathIncluded = Array.isArray(permissions.path) && permissions.path.some(url => req.path === url);

  return isStringPath || isPathIncluded;
}

function handleForbiddenResponse(res: HttpResponse<Record<string, unknown>>): void {
  res.status(403).json({ message: 'You are not allowed for this action' });
}
