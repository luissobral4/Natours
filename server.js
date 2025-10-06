const dotenv = require('dotenv');
const mongoose = require('mongoose');

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
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
