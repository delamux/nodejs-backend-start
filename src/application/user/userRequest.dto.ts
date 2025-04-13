export type UserRequestDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isSuperUser?: boolean;
};
