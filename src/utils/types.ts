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
