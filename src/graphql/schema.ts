import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    username: String!
    email: String!
  }
  type Query {
    getUsers: [User]!
  }
  type Mutation {
    register(username: String!, email: String!, password: String!): User!
  }
`;
