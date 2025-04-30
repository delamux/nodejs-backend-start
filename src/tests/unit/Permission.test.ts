import { describe, expect, it } from 'vitest';
import { UserPermission, UserRole } from '../../infrastructure/permissions';
import { Routes } from '../../infrastructure/routes';

class Permission {
  private static roles: UserRole[] = [];
  private static path: Routes;

  constructor(readonly name: string) {}

  static create(name: string, permission: UserPermission): Permission {
    this.validate(permission);
    return new Permission(name);
  }

  private static validate(permission: UserPermission): void {
    this.validateRole(permission.role);
    this.validatePath(permission.path);
  }

  private static validatePath(path: Routes) {
    if (!path) {
      throw new Error('should contain at least one path allowed');
    }

    this.path = path;
  }

  private static validateRole(role: UserRole[]): void {
    if (role.length === 0) {
      throw new Error('should contain at least one role');
    }

    this.roles = [...role];
  }

  hasRole(role: UserRole): boolean {
    return Permission.roles.includes(role);
  }

  hasPath(path: Routes): boolean {
    return Permission.path === path;
  }
}

describe('Permission test', () => {
  it('should throw an error when is not Role assigned ', () => {
    expect(() => {
      Permission.create(' permission test', { role: [] } as UserPermission);
    }).toThrowError('should contain at least one role');
  });

  it('should throw an error when is not Path assigned ', () => {
    expect(() => {
      Permission.create(' permission test', { role: [UserRole.USER] } as UserPermission);
    }).toThrowError('should contain at least one path allowed');
  });

  it('Add Roles to permission and should has permission for that role', () => {
    const permission = Permission.create(' permission test', {
      role: [UserRole.USER],
      path: Routes.status,
    } as unknown as UserPermission);

    expect(permission.hasRole(UserRole.USER)).toBe(true);
    expect(permission.hasPath(Routes.status)).toBe(true);
    expect(permission.hasPath(Routes.dashBoard)).toBe(false);
  });
});
