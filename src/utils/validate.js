import Joi from "joi";
import _ from "lodash";
import xss from "xss";

const validate = (schema, data) => {
	const validSchema = _.pick(schema, ["params", "query", "body"]);
	const object = _.pick(data, Object.keys(validSchema));
	const { error, value } = Joi.compile(validSchema)
		.prefs({
			errors: { label: "path", wrap: { label: false } },
			abortEarly: false,
		})
		.validate(object);
	if (error) {
		return { error, value };
	}
	return { error, value };
};

const sanitizeAndValidate = (schema, data) => {
	const sanitizedData = JSON.parse(
		JSON.stringify(data, (key, value) =>
			typeof value === "string" ? xss(value) : value
		)
	);
	return validate(schema, sanitizedData);
};

export default sanitizeAndValidate;
