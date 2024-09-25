import Joi from 'joi';

export default {
	register: Joi.object({
		firstName: Joi.string().min(3).max(50).required(),
		lastName: Joi.string().min(3).max(50).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(3).max(50).required(),
	}),
	activeAccount: Joi.object({
		key: Joi.string().min(3).max(100).required(),
	}),

	login: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required(),
	}),

	userUpdate: Joi.object({
		firstName: Joi.string().min(3).max(50).required(),
		lastName: Joi.string().min(3).max(50).required(),
	}),

	updatePassword: Joi.object({
		newPassword: Joi.string().min(3).max(50).required(),
		repeatPassword: Joi.string().min(3).max(50).required(),
	}),
};
