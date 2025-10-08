const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('ERROR', err);

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

const handleJWTErrorDB = () =>
    new AppError('Invalid token. pPlease login again!', 401);

const handleJWTExpiredErrorDB = () =>
    new AppError('Your token has expired. please login again!', 401);

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;

    return new AppError(message, 400);
};

const handleDuplicatedFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicated field value: ${value}.Please use another value!`;

    return new AppError(message, 400);
};

const handleValidatorErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(' ')}`;

    return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicatedFieldsDB(err);
        if (err.name === 'ValidationError') error = handleValidatorErrorDB(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTErrorDB();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredErrorDB();

        sendErrorProd(error, res);
    }
};
