const express = require('express');
const morgan = require('morgan');
const path = require('node:path');

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
    console.log('Hello from the middleware 👋');
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use((req, res, next) => {
    Object.defineProperty(req, 'query', { ...Object.getOwnPropertyDescriptor(req, 'query'), value: req.query, writable: true });
    next();
});

// 2 - ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
