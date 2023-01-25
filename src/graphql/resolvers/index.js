const userResolvers = require("./user-resolvers");
const messageResolvers = require("./message-resolvers");

exports.resolvers = {
  User: {
    createdAt: ({ createdAt }) => createdAt.toISOString(),
  },
  Message: {
    createdAt: ({ createdAt }) => createdAt.toISOString(),
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
};
