import path from 'path';
import fs from 'fs/promises';

import Photo from '../models/Photo.js';
import Posts from '../models/Posts.js';
import Users from '../models/Users.js';

import { generateExcel } from '../services/Report.xlsx.js';
import { sendMail } from '../services/Mail.js';

export default {
	createPost: async (req, res) => {
		try {
			const { title, content } = req.body;
			const { id } = req.user;

			const { files } = req;

			const user = await Users.findByPk(id);
			if (!user) {
				if (files) {
					files.forEach(file => fs.unlink(file.path));
				}
				return res.status(404).json({ message: 'User not found' });
			}

			const post = await Posts.create({
				title,
				content,
				userId: id,
			});

			for (let photo of files) {
				await Photo.create({
					path: Photo.processFilePath(photo),
					postId: post.id,
				});
			}

			const result = await Posts.findByPk(post.id, {
				include: [
					{
						model: Photo,
					},
				],
			});

			res.status(201).json({ message: 'Post created successfully', result });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message, status: 500 });
		}
	},

	getPosts: async (req, res) => {
		try {
			const { limit = 10, page = 1 } = req.query;
			const offset = Math.floor((page - 1) * limit);
			const posts = await Posts.findAll({
				attributes: ['id', 'title', 'content', 'createdAt'],
				include: [
					{
						model: Users,
						attributes: ['id', 'email', 'firstName', 'lastName'],
						include: [
							{
								model: Photo,
								as: 'avatar',
								attributes: ['path'],
							},
						],
					},
					{
						model: Photo,
						attributes: ['path', 'createdAt', 'postId'],
					},
				],
				order: [['id', 'DESC']],
				limit,
				offset,
			});
			res.status(200).json({ message: 'posts list', posts });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: error.message, status: 500 });
		}
	},
	getXLSXPosts: async (req, res) => {
		try {
			const { id, email } = req.user;

			const fileName = `user-posts${Date.now()}.xlsx`;
			const fullPath = path.resolve(`./public/report.XLSX/${fileName}`);

			const posts = await Posts.findAll({
				attributes: ['title', 'content', 'createdAt'],
				include: [
					{
						model: Photo,
						attributes: ['path'],
					},
				],
				where: { userId: id },
			});

			const result = posts.map(post => {
				const data = {
					title: post.title,
					content: post.content,
					createdAt: new Date(post.createdAt).toUTCString(),
					photos: post.photos.map(item => `localhost:3000${item.path}`),
				};

				data.photos.forEach((item, i) => {
					data[`image${++i}`] = item;
				});

				delete data.photos;

				return data;
			});

			if (!posts) {
				res.status(404).json({ message: 'Posts not found' });
				return;
			}

			generateExcel(result, fullPath);

			await sendMail({
				to: email,
				subject: 'Your posts report',
				template: 'postList',
				templateData: {},
				attachments: [
					{
						fileName,
						path: fullPath,
					},
				],
			});

			await fs.unlink(fullPath);

			res.status(200).json({ message: 'your files have been sent your email' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},

	updatePost: async (req, res) => {
		try {
			const { id } = req.params;
			const { id: userId } = req.user;
			const { title, content } = req.body;
			const { files = null } = req;

			const post = await Posts.findOne({
				where: { id, userId },
				include: {
					model: Photo,
				},
			});

			if (!post) {
				if (files) {
					files.forEach(file => fs.unlink(file.path));
				}
				return res
					.status(403)
					.json({ message: 'You are not allowed to edit this post' });
			}

			await Posts.update({ title, content }, { where: { id: id } });

			const pathPhotos = await Photo.findAll({ where: { postId: post.id } });
			await Photo.deleteFiles(pathPhotos);

			for (let photo of files) {
				await Photo.update(
					{
						path: Photo.processFilePath(photo),
					},
					{ where: { postId: post.id } }
				);
			}

			res.status(200).json({ message: 'Post updated successfully' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message, status: 500 });
		}
	},

	deletePost: async (req, res) => {
		try {
			const { id } = req.params;
			if (!id) {
				res.status(400).json({ message: 'Users ID is required' });
				return;
			}

			const post = await Posts.findByPk(id, { raw: true });
			if (!post) {
				return res.status(403).json({ message: 'post not found' });
			}
			console.log(post);

			const pathPhotos = await Photo.findAll({ where: { postId: id } });
			await Photo.deleteFiles(pathPhotos);
			await Posts.destroy({ where: { id: post.id } });

			res.status(200).json({ message: 'Post deleted successfully' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message, status: 500 });
		}
	},

	updatePhoto: async (req, res) => {
		try {
			const { id } = req.params;
			const { file = null } = req;

			const photo = await Photo.findByPk(id, {
				raw: true,
			});
			if (!photo) {
				if (file) {
					await fs.unlink(file.path);
				}
				res.status(403).json({ message: 'Photo not found' });
				return;
			}

			await Photo.deleteFiles([photo.path]);

			await Photo.update(
				{ path: Photo.processFilePath(file) },
				{ where: { id: photo.id } }
			);
			res.status(200).json({ message: 'Photo updated successfully' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message, status: 500 });
		}
	},
};
