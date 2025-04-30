import { describe, it, expect } from 'vitest';

class Permission {
  constructor(readonly name: string) {}

  static create(name: string): Permission {
    this.validate();
    return new Permission(name);
  }

  private static validate(): void {
    throw new Error('should contain at least one role');
  }
}

describe('Permission test', () => {
  it('happy path permissions test', () => {
    const permission = Permission.create(' permission test');

    expect(permission).toBeInstanceOf(Permission);
  });

  it('should throw an error with message: ', () => {
    expect(() => {
      Permission.create(' permission test');
    }).toThrowError('should contain at least one role');
  });
});
