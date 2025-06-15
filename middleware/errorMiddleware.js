import errorHandler from '../utils/errorHandler.js';

const errorMiddleware = (err, req, res, next) => {
  errorHandler(err, req, res, next);
};

export default errorMiddleware;