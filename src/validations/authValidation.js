import Joi from "joi";

const signup = {
	body: Joi.object()
		.keys({
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
						"Password must contains uppercase letters, lowercase letters, numbers, and special characters.",
				}),
			confirmPassword: Joi.string()
				.trim()
				.required()
				.valid(Joi.ref("password"))
				.messages({
					"any.only": "Password and confirmation must be the same.",
				})
				.strip(),
		})
		.options({ stripUnknown: true }),
};

const signin = {
	body: Joi.object()
		.keys({
			username: Joi.string().trim().min(5).max(50),
			email: Joi.string().trim().email(),
			password: Joi.string().trim().min(8).required(),
		})
		.xor("username", "email")
		.options({ stripUnknown: true }),
};

const updateMe = {
	body: Joi.object()
		.keys({
			name: Joi.string().trim().max(150).required(),
			bio: Joi.string(),
			url: Joi.string().trim().uri(),
			pronouns: Joi.string().trim().valid("He", "She", "They", "DontSpecify"),
			gender: Joi.string().trim().valid("Male", "Female"),
		})
		.options({ stripUnknown: true }),
};

const forgotPassword = {
	body: Joi.object()
		.keys({
			email: Joi.string().trim().email().required(),
		})
		.options({ stripUnknown: true }),
};

const resetPassword = {
	params: Joi.object().keys({
		token: Joi.string().trim().required(),
	}),
	body: Joi.object()
		.keys({
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
		})
		.options({ stripUnknown: true }),
};

const verifyEmail = {
	params: Joi.object().keys({
		token: Joi.string().required(),
	}),
};

export default {
	signup,
	signin,
	updateMe,
	forgotPassword,
	resetPassword,
	verifyEmail,
};
