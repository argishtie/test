import sequelize from '../clients/sequelize.mysql.js';
import { DataTypes, Model } from 'sequelize';
import Users from './Users.js';

class ChatRooms extends Model {}

ChatRooms.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    lastUpdatedData: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: 'chat_rooms',
    modelName: 'chatRooms',
  }
);

ChatRooms.belongsTo(Users, {
  foreignKey: 'firstMemberId',
  as: 'firstMember'
})

ChatRooms.belongsTo(Users, {
  foreignKey: 'secondMemberId',
  as: 'secondMember'
});

export default ChatRooms;
