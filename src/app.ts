import { ApolloServer } from "@apollo/server";
import { PubSub } from "graphql-subscriptions";
import { startStandaloneServer } from "@apollo/server/standalone";
import { JwtPayload, verify } from "jsonwebtoken";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import sequelize from "./config/database";
import { authContext } from "./utils/types";

const pubsub = new PubSub();

const server = new ApolloServer<authContext>({
  typeDefs,
  resolvers,
});

sequelize
  .sync()
  .then(() => {
    return startStandaloneServer(server, {
      listen: { port: process.env.PORT ? +process.env.PORT : 4000 },
      context: async ({ req }): Promise<authContext> => {
        const ctxValue: authContext = {
          isAuth: false,
        };
        try {
          const token = req.headers.authorization?.split("Bearer ")[1];

          if (!token) {
            return ctxValue;
          }

          const decoded = verify(token, process.env.JWT_SECRET as string);
          const { username } = decoded as JwtPayload;
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
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
  })
  .catch((err) => console.error(err));
