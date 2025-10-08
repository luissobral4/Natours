const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const dbConnectionString = process.env.DB_CONNECTION_STRING.replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD
);

mongoose
    .connect(dbConnectionString)
    .then(() => console.log('DB connection successful!'));

const tours = JSON.parse(
    // eslint-disable-next-line n/no-sync
    fs.readFileSync(path.join(__dirname, 'tours-simple.json'), 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded!');
    } catch (err) {
        console.log(err);
    }
    // eslint-disable-next-line n/no-process-exit
    process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    // eslint-disable-next-line n/no-process-exit
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
