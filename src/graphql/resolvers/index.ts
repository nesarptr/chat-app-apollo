import userResolvers from "./user-resolvers";
import messageResolvers from "./message-resolvers";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
};
