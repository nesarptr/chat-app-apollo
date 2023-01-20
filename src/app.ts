import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { JwtPayload, verify } from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-errors";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import sequelize from "./config/database";
import { authContext } from "./utils/types";

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
        try {
          const token = req.headers.authorization?.split("Bearer ")[1];
          const ctxValue: authContext = {
            isAuth: false,
          };

          if (!token) {
            return ctxValue;
          }

          const decoded = verify(token, process.env.JWT_SECRET as string);

          ctxValue.isAuth = true;
          ctxValue.username = (decoded as JwtPayload).username;
          return ctxValue;
        } catch (error) {
          throw new AuthenticationError("token is not valid");
        }
      },
    });
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
  })
  .catch((err) => console.error(err));
