import Joi from 'joi';

export default {
	createPost: Joi.object({
		title: Joi.string().min(3).max(50).required(),
		content: Joi.string().min(3).max(50).required(),
	}),

	updatePost: Joi.object({
		title: Joi.string().min(3).max(50).required(),
		content: Joi.string().min(3).max(50).required(),
	}),
};
