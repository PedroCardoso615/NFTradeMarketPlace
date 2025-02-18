const mongoose = require('mongoose');

const {CONNECTION_STRING} = process.env;

const createConnectionWithDb = async () => {
    console.log('Connecting to database...');
    await mongoose.connect(CONNECTION_STRING);
    console.log('Connected to database');
}

const closeConnectionWithDb = async () => {
    console.log('Closing connection with database...');
    await mongoose.connection.close();
    console.log('Connection with database closed');
}

module.exports = {
    createConnectionWithDb,
    closeConnectionWithDb
};