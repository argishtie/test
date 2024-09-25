import sequelize from '../clients/sequelize.mysql.js';
import { DataTypes, Model } from 'sequelize';
import path from 'path';
import fs from 'fs/promises';

import Users from './Users.js';
import Posts from './Posts.js';

class Photo extends Model {
	static async deleteFiles(pathPhotos) {
		for (let photo of pathPhotos) {
			const photoDir = path.resolve(`./public${photo.path}`);
			if (
				await fs
					.access(photoDir)
					.then(() => true)
					.catch(() => false)
			) {
				await fs.unlink(photoDir);
			}
		}
	}

	static processFilePath(file) {
		if (!file) return null;
		const relativePath = file.destination.replace(
			`${path.resolve('./public')}`,
			''
		);

		return path.join(relativePath, file.filename);
	}
}

Photo.init(
	{
		id: {
			type: DataTypes.BIGINT.UNSIGNED,
			primaryKey: true,
			autoIncrement: true,
		},
		path: {
			type: DataTypes.STRING,
		},
	},
	{
		sequelize,
		modelName: 'photo',
		tableName: 'photo',
		timestamps: true,
	}
);

Users.hasMany(Photo, {
	foreignKey: 'userId',
	as: 'avatar',
	onDelete: 'cascade',
});
Photo.belongsTo(Users, {
	foreignKey: 'userId',
	onDelete: 'cascade',
});

Posts.hasMany(Photo, {
	foreignKey: 'postId',
	onDelete: 'cascade',
});
Photo.belongsTo(Posts, {
	foreignKey: 'postId',
	onDelete: 'cascade',
});

export default Photo;
