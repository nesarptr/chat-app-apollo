const { UserInputError, AuthenticationError } = require("apollo-server");
const { Op } = require("sequelize");

import { authContext, Message as IMessage } from "../../utils/types";
import User from "../../models/user";
import Message from "../../models/message";

export default {
  Query: {
    getMessages: async (
      _: null,
      { from }: IMessage,
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

        return messages.map((message) => {
          return {
            ...message.toJSON(),
            createdAt: message.dataValues.createdAt.toISOString(),
          };
        });
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
  Mutation: {
    sendMessage: async (
      _: null,
      { to, content }: IMessage,
      { username, isAuth }: authContext
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

        return {
          ...message.toJSON(),
          createdAt: message.dataValues.createdAt.toISOString(),
        };
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
};
