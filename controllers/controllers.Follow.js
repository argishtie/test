import Follows from '../models/Follows.js';
import Photo from '../models/Photo.js';
import Posts from '../models/Posts.js';
import Users from '../models/Users.js';

export default {
	async followingUser(req, res) {
		try {
			const { id } = req.user;
			const { followingId } = req.params;

			if (!followingId) {
				res.status(400).json({ message: 'Following ID is required' });
				return;
			}

			if (followingId === id) {
				res.status(400).json({ message: 'You cannot un follow yourself' });
				return;
			}

			const follow = await Follows.findOne({
				where: { followerId: id, followingId },
			});

			if (!follow) {
				await Follows.create({ followerId: id, followingId });
				res.status(200).json({ message: 'Followed successfully' });
				return;
			}

			await Follows.destroy({ where: { followerId: id, followingId } });
			res.status(200).json({ message: 'Unfollowed successfully' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},

	async getFollowingPosts(req, res) {
		try {
			const { id: userId } = req.user;
			const { limit = 5, page = 1 } = req.query;
			const offset = Math.ceil((page - 1) * limit);

			const followingPosts = await Posts.findAll({
				attributes: ['id', 'title', 'content', 'createdAt'],
				include: [
					{
						model: Photo,
						attributes: ['path'],
					},
					{
						model: Users,
						attributes: ['firstName', 'lastName', 'email'],
						include: [
							{
								model: Follows,
								attributes: [],
								where: { followerId: userId },
							},
							{
								model: Photo,
								as: 'avatar',
								attributes: ['path'],
							},
						],
					},
				],
				limit,
				offset,
			});

			if (!followingPosts) {
				res.status(404).json({ message: 'You are not following any user' });
				return;
			}

			res
				.status(200)
				.json({ message: 'Posts found successfully', followingPosts });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},
};
