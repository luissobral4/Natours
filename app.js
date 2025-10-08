const express = require('express');
const morgan = require('morgan');
const path = require('node:path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1 - MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        ...Object.getOwnPropertyDescriptor(req, 'query'),
        value: req.query,
        writable: true
    });
    next();
});

// 2 - ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('/{*splat}', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
