export interface authContext {
  isAuth: boolean;
  username?: string;
}

export type registerFuncArgs = {
  username: string;
  email: string;
  password: string;
};

export type loginFuncArgs = {
  username: string;
  password: string;
};

export interface Message {
  uuid: string;
  content: string;
  from: string;
  to: string;
  createdAt: string;
}

export interface User {
  username: string;
  email: string;
  createdAt: string;
  token?: string;
}
