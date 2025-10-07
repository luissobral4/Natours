const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log(`UNCAUGHT EXCEPTION! Shutting down...`);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const db_connection_string = process.env.DB_CONNECTION_STRING.replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD
)

mongoose
    .connect(db_connection_string)
    .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log(`UNHANDLED REJECTION! Shutting down...`);
    server.close(() => {
        process.exit(1);
    });
});
