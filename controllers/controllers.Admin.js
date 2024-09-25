import Photo from '../models/Photo.js';
import Users from '../models/Users.js';

export default {
	async getUsers(req, res) {
		try {
			const limit = 5;
			const { page = 1 } = req.query;
			const offset = (page - 1) * limit;
			const data = await Users.findAll({
				raw: true,
				// limit,
				// offset,
			});

			if (!data) {
				res.status(404).json({ message: 'Users not found' });
				return;
			}

			res.status(200).json({
				usersList: data,
			});
		} catch (error) {
			console.error('Error executing query', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
	async deleteUsers(req, res) {
		try {
			const { id } = req.params;

			if (!id) {
				res.status(400).json({ message: 'Users ID is required' });
				return;
			}

			const user = await Users.findByPk(id);
			if (!user) {
				res.status(404).json({ message: 'Users not found' });
				return;
			}

			const pathPhoto = await Photo.findOne({ where: { userId: id } });
			if (pathPhoto) {
				await Photo.deleteFiles([pathPhoto]);
			}

			const result = await Users.destroy({ where: { id }, raw: true });

			if (!result) {
				res.status(404).json({ message: 'Users not found' });
				return;
			}

			res.status(200).json({ message: 'Users deleted successfully' });
		} catch (error) {
			res.status(500).json({ message: error.message, status: 500 });
		}
	},
};
