import { Routes } from './routes';
import { UserRequestDto } from '../application/user/userRequest.dto';
import { Request } from 'express';

export const ALLOW_ALL = '*';

export enum Method {
  ALL = ALLOW_ALL,
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum UserRole {
  ALL = ALLOW_ALL,
  ADMIN = 'admin',
  USER = 'user',
}

export type UserPermission = {
  roles: UserRole[];
  path: Routes;
  methods: Method[];
  bypassAuth?: boolean;
  allowed?: boolean | ((user: UserRequestDto, request: Request) => boolean);
};

export const permissions: UserPermission[] = [
  {
    roles: [UserRole.ALL],
    path: [Routes.welcome, Routes.status],
    methods: [Method.GET],
    bypassAuth: true,
  },
  {
    roles: [UserRole.ADMIN],
    path: Routes.dashBoard,
    methods: [Method.GET],
    allowed: true,
  },
] as const;
