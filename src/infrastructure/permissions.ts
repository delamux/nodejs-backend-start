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

export enum UserRoles {
  ALL = ALLOW_ALL,
  ADMIN = 'admin',
  USER = 'user',
}

export type Permission = {
  role: UserRoles;
  path: Routes;
  method: Method;
  action?: string | undefined;
  bypassAuth?: boolean;
  allowed?: boolean | ((user: UserRequestDto, request: Request) => boolean);
};

export const permissions: Permission[] = [
  {
    role: UserRoles.ALL,
    path: '',
    method: Method.GET,
    bypassAuth: true,
  },
  {
    role: UserRoles.ADMIN,
    path: '/admin',
    method: Method.GET,
    allowed: true,
  },
] as const;
