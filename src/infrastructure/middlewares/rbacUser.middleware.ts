import { NextFunction, Request } from 'express';
import { UserRequestDto } from '../../application/user/userRequest.dto';
import { HttpResponse } from '../http';
import { ALLOW_ALL, Method, UserPermission, UserRole } from '../permissions';

export interface AuthenticatedRequest extends Request {
  user?: UserRequestDto;
}

export const rbacUserMiddleware =
  (permissions: UserPermission[]) =>
  (req: AuthenticatedRequest, res: HttpResponse<Record<string, unknown>>, next: NextFunction): void => {
    const user = req?.user;
    const userRole = user?.role;
    const permissionFound = permissions.find(permission => {
      const isRoleMatch = hasRoleMatch(permission, userRole as UserRole);
      const isMethodMatch = hastMethodMatched(permission, req.method as Method);
      const isUrlMatch = hasUrlMatched(permission, extractedPath(req.path));
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

function hasRoleMatch(permission: UserPermission, userRole: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(permission.roles) ? permission.roles : [permission.roles];
  const userRoles = Array.isArray(userRole) ? userRole : [userRole];

  return roles.includes(UserRole.ALL) || roles.some(role => userRoles.includes(role));
}

function hastMethodMatched(permission: UserPermission, reqMethod: Method): boolean {
  return Array.isArray(permission.methods) && permission.methods.some(method => reqMethod === method);
}

function extractedPath(path: string): string {
  return path.split('/').slice(0, 2).join('/');
}

function hasUrlMatched(permission: UserPermission, reqPath: string): boolean {
  const isStringPath =
    typeof permission.path === 'string' && (permission.path === reqPath || permission.path === ALLOW_ALL);

  const isPathIncluded = Array.isArray(permission.path) && permission.path.some(url => reqPath === url);

  return isStringPath || isPathIncluded;
}

function handleForbiddenResponse(res: HttpResponse<Record<string, unknown>>): void {
  res.status(403).json({ message: 'You are not allowed for this action' });
}
