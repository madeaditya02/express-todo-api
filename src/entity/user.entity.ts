import { Request } from "express";

export interface Token {
  payload: User;
  iat: number;
  exp: number;
}

export type User = {
  id: string;
  username: string;
};

export interface RequestWithUser extends Request {
  user?: User;
}
