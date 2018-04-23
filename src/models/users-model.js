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
    }

    async createUser(nickname, userData) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            result.data = await this._dbContext.one(`INSERT INTO users (nickname, about, fullname, email) 
            VALUES ('${nickname}', '${userData.about}', '${userData.fullname}', '${userData.email}') 
            RETURNING *`);
            result.isSuccess = true;
        }
        catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    async getUserByNicknameOrEmail(nickname, email) {
        try {
            return await this._dbContext.manyOrNone(`SELECT * FROM users WHERE nickname = '${nickname}'
            OR email = '${email}'`);
        }
        catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async getUserByNickname(nickname) {
        try {
            return await this._dbContext.oneOrNone(`SELECT * FROM users WHERE nickname = '${nickname}'`);
        }
        catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async updateUser(nickname, userData) {
        try {
            return await this._dbContext.oneOrNone(`UPDATE users SET
            about = '${userData.about}', 
            fullname = '${userData.fullname}', 
            email = '${userData.email}'
            WHERE nickname = '${nickname}'
            RETURNING *`);
        }
        catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

}