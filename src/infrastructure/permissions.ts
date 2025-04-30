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
  role: UserRole[];
  path: Routes;
  method: Method[];
  bypassAuth?: boolean;
  allowed?: boolean | ((user: UserRequestDto, request: Request) => boolean);
};

export const permissions: UserPermission[] = [
  {
    role: [UserRole.ALL],
    path: [Routes.welcome, Routes.status],
    method: [Method.GET],
    bypassAuth: true,
  },
  {
    role: [UserRole.ADMIN],
    path: Routes.dashBoard,
    method: [Method.GET],
    allowed: true,
  },
] as const;
