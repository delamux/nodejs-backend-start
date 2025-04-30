import { describe, it, expect } from 'vitest';

class Permission {
  constructor(readonly name: string) {}

  static create(name: string): Permission {
    return new Permission(name);
  }
}

describe('Permission test', () => {
  it('happy path permissions test', () => {
    const permission = Permission.create(' permission test');

    expect(permission).toBeInstanceOf(Permission);
  });
});
