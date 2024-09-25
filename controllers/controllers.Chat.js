import { Op } from 'sequelize';

import Chat from '../models/Chat.js';
import Follows from '../models/Follows.js';
import Users from '../models/Users.js';
import Photo from '../models/Photo.js';
import ChatRooms from "../models/ChatRooms.js";

export default {
  async getChatMessages(req, res) {
    try {
      const { userId } = req.query;

      const { id } = req.user;

      const data = await Chat.findAll({
        where: {
          [Op.or]: [
            { senderId: userId, receiverId: id },
            { senderId: id, receiverId: userId },
          ],
        },
        raw: true,
      });

      if (!data) {
        res.status(404).json({ message: 'Messages not found' });
        return;
      }
      res.status(200).json({
        messages: data,
      });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  getFlowsUsers: async (req, res) => {
    try {
      const { id } = req.user;

      let rooms = await ChatRooms.findAll({
        where: {
          [Op.or]: [
            { firstMemberId: id, },
            { secondMemberId: id }
          ]
        },
        include: [
          {
            model: Users,
            as: 'firstMember',
            include: [{ model: Photo, as: 'avatar' }],
          },
          {
            model: Users,
            as: 'secondMember',
            include: [{ model: Photo, as: 'avatar' }],
          }
        ],
        order: [['lastUpdatedData', 'DESC']],
      });

      rooms = rooms.map((room) => room.toJSON());

      rooms.forEach((room) => {
        console.log(room.firstMember.id)
        if (room.firstMember.id === id) {
          delete room.firstMember;
          room.user = room.secondMember;
          delete room.secondMember;
        } else if (room.secondMember.id === id) {
          delete room.secondMember;
          room.user = room.firstMember;
          delete room.firstMember;
        }

        room.user.avatar = room.user.avatar[0].path || null;
      });
      console.log(req.user)
      res.status(200).json({ rooms, user: req.user });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // getFlowsRequests: async (req, res) => {
  // 	try {
  // 		const { id } = req.user;
  // 		const { limit = 10, page = 1 } = req.query;
  // 		const offset = (page - 1) * limit;

  // 		console.log(id);

  // 		const followingRequests = await Follows.findAll({
  // 			attributes: ['followingId'],
  // 			include: [
  // 				{
  // 					model: Users,
  // 					attributes: ['id', 'firstName', 'lastName', 'email'],

  // 					include: [
  // 						{
  // 							model: Photo,
  // 							as: 'avatar',
  // 							attributes: ['path'],
  // 						},
  // 						{
  // 							model: Chat,
  // 							attributes: ['message', 'senderId', 'receiverId'],
  // 						},
  // 					],
  // 				},
  // 			],

  // 			where: {
  // 				followingId: id,
  // 			},
  // 			limit,
  // 			offset,
  // 		});

  // 		if (!followingRequests) {
  // 			res.status(404).json({ message: 'No followers found' });
  // 			return;
  // 		}

  // 		const requests = followingRequests.map(item => {
  // 			return {
  // 				id: item.user.id,
  // 				avatar: item.user.avatar[0].path,
  // 				firstName: item.user.firstName,
  // 				lastName: item.user.lastName,
  // 				email: item.user.email,
  // 				message: item.user.Chats,
  // 			};
  // 		});

  // 		console.log(requests);

  // 		res.status(200).json({ followingRequests });
  // 	} catch (error) {
  // 		console.error('Error executing query:', error.message);
  // 		res.status(500).json({ message: 'Internal server error' });
  // 	}
  // },
};
