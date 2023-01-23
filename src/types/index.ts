import { PubSub } from "apollo-server";

export interface authContext {
  isAuth: boolean;
  token?: string;
  pubsub?: PubSub;
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

export type getMessagesFuncArgs = {
  content: string;
  from: string;
  to: string;
};

export type sendMessagesFuncArgs = {
  content: string;
  to: string;
};

export interface IUser {
  username: string;
  email: string;
  createdAt: Date;
  token?: string;
}

export interface IMessage {
  uuid: string;
  content: string;
  from: string;
  to: string;
  createdAt: Date;
}
