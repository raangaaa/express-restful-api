import Joi from "joi";

const signup = {
	body: Joi.object().keys({
		name: Joi.string().trim().max(150).required(),
		username: Joi.string().trim().min(5).max(50).required(),
		email: Joi.string().trim().email().required(),
		password: Joi.string()
			.trim()
			.min(8)
			.required()
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
			)
			.messages({
				"string.pattern.base":
					"Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus.",
			}),
		confirmPassword: Joi.string()
			.trim()
			.required()
			.valid(Joi.ref("password"))
			.messages({
				"any.only": "Password dan confirmPassword harus sama.",
			})
			.strip(),
	}).options({ stripUnknown: true })
};

const signin = {
	body: Joi.object()
		.keys({
			username: Joi.string().trim().min(5).max(50),
			email: Joi.string().trim().email(),
			password: Joi.string().trim().min(8).required(),
		})
		.xor("username", "email"),
};

const forgotPassword = {
	body: Joi.object().keys({
		email: Joi.string().trim().email().required(),
	}),
};

const resetPassword = {
	params: Joi.object().keys({
		token: Joi.string().trim().required(),
	}),
	body: Joi.object().keys({
		password: Joi.string()
			.trim()
			.min(8)
			.required()
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
			)
			.messages({
				"string.pattern.base":
					"Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus.",
			}),
		confirmPassword: Joi.string()
			.trim()
			.required()
			.valid(Joi.ref("password"))
			.messages({
				"any.only": "Password dan confirmPassword harus sama.",
			}),
	}),
};

const verifyEmail = {
	params: Joi.object().keys({
		token: Joi.string().required(),
	}),
};

export default {
    signup,
    signin,
    forgotPassword,
    resetPassword,
    verifyEmail
};

