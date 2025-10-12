const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message, err.stack);
    console.log(`UNCAUGHT EXCEPTION! Shutting down...`);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const dbConnectionString = process.env.DB_CONNECTION_STRING.replace(
    '<db_password>',
    process.env.DB_PASSWORD
);

mongoose
    .connect(dbConnectionString)
    .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message, err.stack);
    console.log(`UNHANDLED REJECTION! Shutting down...`);
    server.close(() => {
        // eslint-disable-next-line n/no-process-exit
        process.exit(1);
    });
});
