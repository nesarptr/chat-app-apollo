import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    username: String!
    email: String!
  }
  type Query {
    getUsers: [User]!
  }
`;
