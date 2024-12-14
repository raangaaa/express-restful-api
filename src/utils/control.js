import errorAPI from "./errorAPI.js"

/**
 * Handle the controller error to error middleware express
 * @param {Function} func - Controller will be handle
 * @returns {Promise<void|errorAPI>}
 */
const control = func => (req, res, next) => {
  Promise.resolve(func(req, res)).catch(err => next(err));
};

export default control;
