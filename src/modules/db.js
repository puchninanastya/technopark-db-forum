/**
 * Database module.
 * @module modules/db
 */

const pgp = require('pg-promise')({
    capSQL: true // if you want all generated SQL capitalized
});

/** Class representing a Database module. */
export default class DatabaseModule {

    /**
     * Create an DB module.
     * @param connOptions - options for database connections
     */
    constructor(connOptions = {}) {
        this._pgp = pgp;
        this._db = pgp(connOptions); // database instance
    }

    get db() {
        return this._db;
    }

    get pgp() {
        return this._pgp;
    }

}