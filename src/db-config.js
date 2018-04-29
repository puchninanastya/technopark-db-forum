/**
 * Database configuration for database module
 */

import DatabaseModule from './modules/db';

// Database connection details;
const connOptions = {
    host: 'localhost', // localhost is the default
    port: 5432, // 5432 is the default;
    database: 'docker',
    user: 'docker',
    password: 'docker'
};

let dbConfig = new DatabaseModule(connOptions);

export default dbConfig;
