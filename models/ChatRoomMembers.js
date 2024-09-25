import sequelize from '../clients/sequelize.mysql.js';
import { DataTypes, Model } from 'sequelize';

import Users from './Users.js';
import ChatRooms from './ChatRooms.js';

class ChatRoomMembers extends Model {}

ChatRoomMembers.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: 'chat_room_members',
    modelName: 'chatRoomMembers',
  }
);

ChatRooms.hasMany(ChatRoomMembers, {
  foreignKey: 'roomId',
  as: 'members',
});

ChatRoomMembers.belongsTo(ChatRooms, {
  foreignKey: 'roomId',
  as: 'chatRoom',
});

ChatRoomMembers.belongsTo(Users, {
  foreignKey: 'memberId',
  as: 'member',
})

export default ChatRoomMembers;
