import userResolvers from "./user-resolvers";
import messageResolvers from "./message-resolvers";
import { IUser, IMessage } from "../../utils/types";

export const resolvers = {
  User: {
    createdAt: ({ createdAt }: IUser) => createdAt.toISOString(),
  },
  Message: {
    createdAt: ({ createdAt }: IMessage) => createdAt.toISOString(),
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
};
