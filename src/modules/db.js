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

        this._dropAndCreateSql = this.sql('./db/drop_and_create.sql');
    }

    get db() {
        return this._db;
    }

    get pgp() {
        return this._pgp;
    }

    async initializeDatabase() {
        try {
            await db.any(this._dropAndCreateSql);
        } catch (error) {
            if (error instanceof this._pgp.errors.QueryFileError) {
                console.error('ERROR: ', error);
            }
        }
    }

    // Helper for linking to external query files:
    sql(file) {
        const fullPath = path.join(__dirname, file);
        return new pgp.QueryFile(fullPath, {minify: true});
    }

}