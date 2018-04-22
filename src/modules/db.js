/**
 * Database module.
 * @module modules/db
 */

const pgp = require('pg-promise')();

/** Class representing a Database module. */
export default class DatabaseModule {

    /**
     * Create an DB module.
     * @param connOptions - options for database connections
     */
    constructor(connOptions = {}) {
        this._db = pgp(connOptions); // database instance
    }

    get db() {
        return this._db;
    }

}