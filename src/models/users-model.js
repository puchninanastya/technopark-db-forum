/**
 * Users model.
 * @module models/users-model
 */

import dbConfig from '../db-config';

/** Class representing an Users model. */
export default new class UsersModel {

    /**
     * Create an Users model.
     */
    constructor() {
        this._dbContext = dbConfig.db;
        console.log('db context: ', this._dbContext);
    }

    getUser(nickname) {
        return this._dbContext.oneOrNone(`SELECT * FROM users WHERE nickname = '${nickname}'`);
    }

    createUser(nickname, userData) {
        return this._dbContext.one(`INSERT INTO users (nickname, email, fullname, about) 
            VALUES ('${nickname}', '${userData.email}', '${userData.fullname}', '${userData.about}') 
            RETURNING *`);
    }

}