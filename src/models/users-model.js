/**
 * Users model.
 * @module models/users-model
 */

import dbConfig from '../db-config';
const PQ = require('pg-promise').ParameterizedQuery;

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
            const createUserQuery = new PQ(`INSERT INTO users (nickname, about, fullname, email) 
                VALUES ($1, $2, $3, $4) RETURNING *`);
            createUserQuery.values = [nickname, userData.about, userData.fullname, userData.email];
            result.data = await this._dbContext.one(createUserQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    async getUserByNicknameOrEmail(nickname, email) {
        try {
            const getUserQuery = new PQ(`SELECT * FROM users WHERE nickname = $1 OR email = $2`);
            getUserQuery.values = [nickname, email];
            return await this._dbContext.manyOrNone(getUserQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async getUserByNickname(nickname) {
        try {
            const getUserQuery = new PQ(`SELECT * FROM users WHERE nickname = $1`, [nickname]);
            return await this._dbContext.oneOrNone(getUserQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async updateUser(nickname, userData) {
        try {
            const updateUserQuery = new PQ(`UPDATE users SET
                about = $1, fullname = $2, email = $3 WHERE nickname = $4 
                RETURNING *`);
            updateUserQuery.values = [userData.about, userData.fullname, userData.email, nickname];
            return await this._dbContext.oneOrNone(updateUserQuery);
        }
        catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

}