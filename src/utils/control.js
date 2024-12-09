const control = func => (req, res, next) => {
  Promise.resolve(func(req, res)).catch(err => next(err));
};

export default control;
