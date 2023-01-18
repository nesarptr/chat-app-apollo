import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import sequelize from "./config/database";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

sequelize
  .sync()
  .then(() => {
    return startStandaloneServer(server, {
      listen: { port: process.env.PORT ? +process.env.PORT : 4000 },
    });
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
  })
  .catch((err) => console.log(err));
