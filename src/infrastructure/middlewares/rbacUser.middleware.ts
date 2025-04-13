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
    const permission = permissions.find(perm => {
      const isRoleMatch = perm.role === userRole || perm.role === ALLOW_ALL;
      const isMethodMatch = perm.method === req.method || perm.method === ALLOW_ALL;
      const isUrlMatch =
        (typeof perm.path === 'string' && (perm.path === req.path || perm.path === ALLOW_ALL)) ||
        (Array.isArray(perm.path) && perm.path.some(url => req.path === url));
      const byPassAuth = perm?.bypassAuth !== undefined && perm?.bypassAuth === true;

      if (isUrlMatch && isMethodMatch && byPassAuth) {
        return next();
      }

      const isActionMatch = perm?.action === req.path || perm?.action === ALLOW_ALL || perm?.action === undefined;

      return isRoleMatch && isMethodMatch && isUrlMatch && isActionMatch;
    });

    if (permission === undefined) {
      return handleForbiddenResponse(res);
    }

    if (!user) {
      return handleForbiddenResponse(res);
    }
    if (user?.isSuperUser === true) {
      return next();
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

function handleForbiddenResponse(res: HttpResponse<Record<string, unknown>>): void {
  res.status(403).json({ message: 'You are not allowed for this action' });
}
