import sequelize from '../clients/sequelize.mysql.js';

import { DataTypes, Model } from 'sequelize';

import Users from './Users.js';
class Posts extends Model {}

Posts.init(
	{
		id: {
			type: DataTypes.BIGINT.UNSIGNED,
			primaryKey: true,
			autoIncrement: true,
		},
		title: {
			type: DataTypes.STRING,
		},
		content: {
			type: DataTypes.STRING,
		},
	},

	{
		sequelize,
		timestamps: true,
		tableName: 'posts',
		modelName: 'posts',
	}
);

Users.hasMany(Posts, {
	foreignKey: 'userId',

	onDelete: 'cascade',
});
Posts.belongsTo(Users, {
	foreignKey: 'userId',
	onDelete: 'cascade',
});
export default Posts;
