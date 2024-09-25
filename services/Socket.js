import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import Users from '../models/Users.js';
import Chat from '../models/Chat.js';

import ChatRooms from "../models/ChatRooms.js";
// import ChatRoomMembers from "../models/ChatRoomMembers.js";
import { Op } from "sequelize";

const socketIOChat = server => {
  const io = new Server(server);

  io.on('connection', async client => {
    console.log('User connected');

    await authorize(client);
    handleNewMessage(client);

    client.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  const authorize = async client => {
    const { headers } = client.handshake;
    const { authorization = '' } = headers;
    const { JWT_TOKEN } = process.env;

    try {
      const verifyUser = jwt.verify(authorization, JWT_TOKEN);
      const user = await Users.findByPk(verifyUser.id, { raw: true });

      if (!user) {
        return;
      }

      client.join(`user:${user.id}`);
      client.userData = user;
    } catch (error) {
      console.log(error);
      setTimeout(() => {
        client.emit('error', { message: e.message });
      }, 500);
    }
  };

  const handleNewMessage = client => {
    client.on('newMessage', async msg => {
      const { message, userId } = msg;

      await Chat.create({
        senderId: client.userData.id,
        receiverId: userId,
        message,
      });

      io.to(`user:${userId}`).emit('newMessage', {
        message,
        senderId: client.userData.id,
        senderName: client.userData.firstName + ' ' + client.userData.lastName,
      });

      const room = await ChatRooms.findOne({
        where: {
          [Op.or]: [
            {
              firstMemberId: client.userData.id,
              secondMemberId: userId,
            },
            {
              firstMemberId: userId,
              secondMemberId: client.userData.id,
            }
          ]
        }
      });

      if (!room) {
        await ChatRooms.create({
          firstMemberId: client.userData.id,
          secondMemberId: userId,
        });
      } else {
        await room.update({
          lastUpdatedData: new Date(),
        })
      }
    });

    client.on('typing', async msg => {
      const { userId } = msg;

      io.to(`user:${userId}`).emit('typing', {
        senderId: client.userData.id,
        senderName: client.userData.firstName + ' ' + client.userData.lastName,
      });
    });
  };
};

export default socketIOChat;
