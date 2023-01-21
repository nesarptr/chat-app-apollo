import { UserInputError, AuthenticationError } from "apollo-server-errors";
import { withFilter } from "graphql-subscriptions";
import { Op } from "sequelize";

import {
  authContext,
  getMessagesFuncArgs,
  sendMessagesFuncArgs,
} from "../../utils/types";
import User from "../../models/user";
import Message from "../../models/message";
import { verify } from "jsonwebtoken";

export default {
  Query: {
    getMessages: async (
      _: null,
      { from }: getMessagesFuncArgs,
      { username, isAuth }: authContext
    ) => {
      try {
        if (!isAuth) throw new AuthenticationError("User is not Authenticated");

        const otherUser = await User.findOne({
          where: { username: from },
        });
        if (!otherUser) throw new UserInputError("User not found");

        const usernames = [username, otherUser.dataValues.username];

        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: usernames },
            to: { [Op.in]: usernames },
          },
          order: [["createdAt", "DESC"]],
        });

        return messages;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
  Mutation: {
    sendMessage: async (
      _: null,
      { to, content }: sendMessagesFuncArgs,
      { username, isAuth, pubsub }: authContext
    ) => {
      try {
        if (!isAuth) throw new AuthenticationError("User is not Authenticated");

        const recipient = await User.findOne({ where: { username: to } });

        if (!recipient) {
          throw new UserInputError("User not found");
        } else if (recipient.dataValues.username === username) {
          throw new UserInputError("You can't message yourself");
        }

        if (content.trim() === "") {
          throw new UserInputError("Message is empty");
        }

        const message = await Message.create({
          from: username,
          to,
          content,
        });

        pubsub?.publish("NEW_MESSAGE", { newMessage: message });

        return message;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub, username, token }) => {
          try {
            verify(token, process.env.JWT_SECRET as string);
            if (!username) throw new Error();
            return pubsub.asyncIterator(["NEW_MESSAGE"]);
          } catch (error) {
            throw new AuthenticationError("User is not Authenticated");
          }
        },
        ({ newMessage }, _, { username }) =>
          newMessage.from === username || newMessage.to === username
      ),
    },
  },
};
