import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    username: String!
    email: String!
    createdAt: String!
    token: String
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  type Query {
    getUsers: [User]!
    login(username: String!, password: String!): User!
  }
  type Mutation {
    register(username: String!, email: String!, password: String!): User!
    sendMessage(to: String!, content: String!): Message!
  }
`;
