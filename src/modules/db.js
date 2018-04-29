/**
 * Database module.
 * @module modules/db
 */

const path = require('path');

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

        //this._dropAndCreateSql = this.sql('./db/drop_and_create.sql');
        //this.initializeDatabase();
    }

    get db() {
        return this._db;
    }

    get pgp() {
        return this._pgp;
    }

    initializeDatabase() {
        this._db.any(this._dropAndCreateSql)
            .then(() => {
                console.log('db initialized');
            })
            .catch(error => {
                if (error instanceof pgp.errors.QueryFileError) {
                    console.error('db is not initialized!');
                }
            });
    }

    // Helper for linking to external query files:
    sql(file) {
        const fullPath = path.join(__dirname, file);
        return new this._pgp.QueryFile(fullPath, {minify: true});
    }

}