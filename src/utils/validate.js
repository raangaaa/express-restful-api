import Joi from "joi";
import _ from "lodash";
import xss from "xss";
import errorAPI from "./errorAPI.js";

/**
 * Validate data using Joi module
 * @param {Object} schema - Joi schema to validate data
 * @param {Object} data - Data to validate matches schema
 * @returns {Object} - Error or value
 * @example
 * const { error, value } = validate(schema, data)
 */
const validate = (schema, data) => {
    const validSchema = _.pick(schema, ["params", "query", "body"]);
    const object = _.pick(data, Object.keys(validSchema));
    const { error, value } = Joi.compile(validSchema)
        .prefs({
            errors: { label: "key" },
            abortEarly: false
        })
        .validate(object);
    return { error, value };
};

/**
 * Sanitize and Validate request using Joi and xss
 * @param {Object} schema - Joi schema to validate request 
 * @returns {void}
 */
const sanitizeAndValidate = (schema) => (req, res, next) => {
    const sanitizedData = JSON.parse(JSON.stringify(req, (key, value) => (typeof value === "string" ? xss(value) : value)));

    const { error, value } = validate(schema, sanitizedData);

    if (error) {
        return next(
            new errorAPI(
                "Validation error",
                400,
                error.details.map((detail) => detail.message)
            )
        );
    }

    req.data = value;
    return next();
};

export default sanitizeAndValidate;
