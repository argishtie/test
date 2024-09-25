import { DataTypes, Model } from 'sequelize';

import sequelize from '../clients/sequelize.mysql.js';

import Users from './Users.js';

class Follows extends Model {}

Follows.init(
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
		indexes: [
			{
				unique: true,
				fields: ['followerId', 'followingId'],
			},
		],
		modelName: 'follow',
		tableName: 'follow',
	}
);

Users.hasMany(Follows, {
	foreignKey: 'followingId',
	onDelete: 'cascade',
});
Follows.belongsTo(Users, {
	foreignKey: 'followerId',
	onDelete: 'cascade',
});

export default Follows;
