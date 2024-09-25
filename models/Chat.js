import sequelize from '../clients/sequelize.mysql.js';
import { DataTypes, Model } from 'sequelize';
import Users from './Users.js';

class Chat extends Model {}

Chat.init(
	{
		id: {
			type: DataTypes.BIGINT.UNSIGNED,
			primaryKey: true,
			autoIncrement: true,
		},
		message: {
			type: DataTypes.TEXT,
		},
	},
	{
		sequelize,
		timestamps: true,
		tableName: 'chat',
		modelName: 'Chat',
	}
);

Users.hasMany(Chat, {
	foreignKey: 'senderId',
	onDelete: 'CASCADE',
});
Chat.belongsTo(Users, {
	foreignKey: 'senderId',
	onDelete: 'CASCADE',
});

Users.hasMany(Chat, {
	foreignKey: 'receiverId',
	onDelete: 'CASCADE',
});
Chat.belongsTo(Users, {
	foreignKey: 'receiverId',
	onDelete: 'CASCADE',
});

export default Chat;
