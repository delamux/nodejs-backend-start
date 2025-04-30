import { Method, UserPermission, UserRole } from './permissions';
import { Routes } from './routes';

export class Permission {
  private static roles: UserRole[] = [];
  private static path: Routes;
  private static methods: Method[];
  private static bypassAuth: boolean;

  constructor(readonly name: string) {}

  static create(name: string, permission: UserPermission): Permission {
    this.validate(permission);
    return new Permission(name);
  }

  private static validate(permission: UserPermission): void {
    this.validateRole(permission.roles);
    this.validatePath(permission.path);
    this.validateMethod(permission.methods);
  }

  private static validateMethod(method: Method[]): void {
    if (method === undefined || method.length === 0) {
      throw new Error('Should contain at least one method');
    }
    if (!method.some(m => Object.values(Method).includes(m))) {
      throw new Error('Should contain a valid method');
    }

    this.methods = [...method];
  }

  private static validateRole(roles: UserRole[]): void {
    if (roles.length === 0) {
      throw new Error('Should contain at least one role');
    }

    if (!roles.some(role => Object.values(UserRole).includes(role))) {
      throw new Error('Should has a valid role');
    }

    this.roles = [...roles];
  }

  private static validatePath(path: Routes): void {
    if (!path) {
      throw new Error('Should contain at least one path allowed');
    }

    if (!Object.values(Routes).includes(path)) {
      throw new Error('Should have a valid path');
    }

    this.path = path;
  }

  hasRole(role: UserRole): boolean {
    return Permission.roles.includes(role);
  }

  hasPath(path: Routes): boolean {
    return Permission.path === path;
  }

  hasMethod(method: Method): boolean {
    return Permission.methods.includes(method);
  }

  hasPermission(): boolean {
    if (Permission.bypassAuth) {
      return true;
    }
  }
}
