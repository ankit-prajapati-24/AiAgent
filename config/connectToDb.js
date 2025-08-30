const mongoose = require('mongoose');
require("dotenv").config();

const dbconnect = () => {
    mongoose.connect(process.env.DATABASE_URL, {
    }).then(() => {
        console.log('Connected to the database');
    }).catch((err) => {
        console.error('Error in database connection:', err);
    });
}

module.exports = dbconnect;
