// @ts-nocheck
const { ApolloServer, PubSub } = require("apollo-server");
const { verify } = require("jsonwebtoken");

const { typeDefs } = require("./graphql/schema");
const { resolvers } = require("./graphql/resolvers");
const sequelize = require("./config/database");

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, connection }) => {
    const ctxValue = {
      isAuth: false,
    };
    try {
      const token =
        req?.headers?.authorization?.split("Bearer ")[1] ||
        connection?.context?.authorization.split("Bearer ")[1];
      console.log(connection?.context);
      if (!token) {
        return ctxValue;
      }
      const decoded = verify(token, process.env.JWT_SECRET);
      const { username } = decoded;
      if (username) {
        ctxValue.isAuth = true;
        ctxValue.username = username;
        ctxValue.pubsub = pubsub;
        ctxValue.token = token;
      }
    } catch (error) {
      console.error(error);
    } finally {
      return ctxValue;
    }
  },
});

sequelize
  .sync()
  .then(() => {
    return server.listen();
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
  })
  .catch((err) => console.error(err));
