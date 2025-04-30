import { describe, expect, it } from 'vitest';
import { UserPermission, UserRole } from '../../infrastructure/permissions';

class Permission {
  private static roles: UserRole[] = [];
  constructor(readonly name: string) {}

  static create(name: string, permission: UserPermission): Permission {
    this.validate(permission);
    return new Permission(name);
  }

  private static validate(permission: UserPermission): void {
    this.roles = [...permission.role];
    if (this.roles.length === 0) {
      throw new Error('should contain at least one role');
    }
  }

  hasRole(role: UserRole): boolean {
    return Permission.roles.includes(role);
  }
}

describe('Permission test', () => {
  it('should throw an error with message: ', () => {
    expect(() => {
      Permission.create(' permission test', { role: [] } as UserPermission);
    }).toThrowError('should contain at least one role');
  });

  it('Add Roles to permission and should has permission for that role', () => {
    const permission = Permission.create(' permission test', {
      role: [UserRole.USER],
    } as UserPermission);

    expect(permission.hasRole(UserRole.USER)).toBe(true);
  });
});
