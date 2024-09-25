import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { sendMail } from '../services/Mail.js';

import utils from '../utils/utils.js';
import Users from '../models/Users.js';
import Photo from '../models/Photo.js';
const { USER_PASSWORD_KEY } = process.env;

export default {
	async registration(req, res) {
		try {
			const { firstName, lastName, email, password } = req.body;
			const { file } = req;

			const mailExists = await Users.findOne({ where: { email } });

			if (mailExists) {
				await fs.unlink(file.path);
				res.status(409).json({ message: 'Email already exists' });
				return;
			}

			const user = await Users.create({
				firstName,
				lastName,
				email: email.toLowerCase(),
				password: password,
			});

			await Photo.create({
				userId: user.id,
				path: Photo.processFilePath(file),
			});

			const result = await Users.findByPk(user.id, {
				include: [
					{
						model: Photo,
						as: 'avatar',
						attributes: ['path'],
					},
				],
			});
			const activationKey = uuid();

			await Users.update(
				{
					activationKey,
				},
				{ where: { id: user.id } }
			);

			await sendMail({
				to: result.email,
				subject: 'welcome to our site',
				template: 'sendEmailCode',
				templateData: {
					title: `hi ${user.firstName} ${user.lastName}`,
					avatar: result.avatar[0].path,
					link: `https://settling-bunny-happy.ngrok-free.app/users/activate?key=${activationKey}`,
				},
			});
			res.status(201).json({ message: 'User created successfully', result });
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: e.message });
		}
	},

	async activeAccount(req, res) {
		try {
			const { key } = req.query;
			const user = await Users.findOne({ where: { activationKey: key } });

			if (!user) {
				res.status(404).json({ message: 'User does not exist' });
				return;
			}

			if (user.status === 'activated') {
				res.status(200).json({ message: 'Account already activated' });
				return;
			}

			await Users.update({ status: 'activated' }, { where: { id: user.id } });

			res.status(200).json({ message: 'Account activated successfully' });
		} catch (error) {
			console.log(error);
			res
				.status(500)
				.json({ message: 'Internal server error', error: error.message });
		}
	},
	async login(req, res) {
		try {
			const { email, password } = req.body;

			const user = await Users.findOne({ where: { email } });

			if (
				!user ||
				Users.hashPassword(password) !== user.getDataValue('password')
			) {
				res.status(401).json({ message: 'Invalid email or password' });
				return;
			}

			if (user.status !== 'activated') {
				res.status(401).json({ message: 'Please activate your account' });
				return;
			}

			const payload = {
				id: user.id,
				email: user.email,
			};

			const token = utils.createToken(payload);

			if (user.type === 'admin') {
				res
					.status(200)
					.json({ message: 'Login successful', token, isAdmin: true });
				return;
			}

			res
				.status(200)
				.json({ message: 'Login successful', token, isAdmin: false });
		} catch (error) {
			console.log(error);

			res
				.status(500)
				.json({ message: 'Internal server error', error: error.message });
		}
	},

	async userProfile(req, res) {
		try {
			const { email, id } = req.user;

			if (!email) {
				res.status(400).json({ message: 'Email not found in token' });
				return;
			}

			const user = await Users.findByPk(id, {
				include: [
					{
						model: Photo,
						as: 'avatar',
						attributes: ['path'],
					},
				],
			});

			if (!user) {
				res.status(404).json({ message: 'User not found' });
				return;
			}
			res.status(200).json({ user });
		} catch (e) {
			console.error('Error fetching user profile:', e);
			res.status(500).json({ message: e.message, status: 500 });
		}
	},
	async userUpdate(req, res) {
		try {
			const { id } = req.user;
			const { firstName, lastName } = req.body;
			const { file } = req;

			const user = await Users.findByPk(id, {
				include: [
					{
						model: Photo,
						as: 'avatar',
						attributes: ['path'],
					},
				],
			});

			if (!user) {
				await fs.unlink(file.path);
				res.status(404).json({
					message: 'User not found',
				});
				return;
			}
			const pathPhoto = await Photo.findOne({ where: { userId: id } });

			if (pathPhoto) {
				await Photo.deleteFiles([pathPhoto]);
			}

			await Photo.create({
				path: Photo.processFilePath(file),
				userId: id,
			});

			await Users.update(
				{
					firstName,
					lastName,
					email: user.email,
				},
				{ where: { id } }
			);

			res.status(200).json({
				message: 'User updated successfully',
			});
		} catch (error) {
			console.error('Error updating user profile:', error);
			res.status(500).json({
				message: 'Internal server error',
			});
		}
	},

	async forgotPassword(req, res) {
		try {
			const { email } = req.body;
			const user = await Users.findOne({ where: { email } });
			if (!user) {
				res.status(404).json({ message: 'wrong email address' });
				return;
			}
			if (user.status !== 'activated') {
				res.status(401).json({ message: 'Please activate your account' });
				return;
			}
			const payload = jwt.sign(
				{ id: user.id, email: user.email },
				USER_PASSWORD_KEY,
				{
					expiresIn: '1d',
				}
			);

			await sendMail({
				to: user.email,
				subject: 'update password account',
				template: 'passwordMessage',
				templateData: {
					title: 'Update password',
					link: `https://settling-bunny-happy.ngrok-free.app/users/update/password?key=${payload}`,
				},
			});
			res.status(200).json({ message: 'Email sent successfully' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},

	async updatePassword(req, res) {
		try {
			const { repeatPassword } = req.body;
			const { key } = req.query;

			if (!key) {
				return res.status(400).json({ message: 'Token must be provided' });
			}
			const verifyPass = jwt.verify(key, USER_PASSWORD_KEY);

			if (!verifyPass) {
				return res.status(401).json({ message: 'Invalid password key' });
			}

			await Users.update(
				{ password: repeatPassword },
				{ where: { id: verifyPass.id } }
			);

			res.status(200).json({ message: 'Password updated successfully' });
		} catch (error) {
			console.log('Error:', error);
			res.status(500).json({ message: error.message });
		}
	},
};
