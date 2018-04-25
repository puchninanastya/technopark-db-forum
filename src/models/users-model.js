/**
 * Users model.
 * @module models/users-model
 */


const PQ = require('pg-promise').ParameterizedQuery;
// const pgp_helpers = require('pg-promise').helpers;

import dbConfig from '../db-config';
import { column_with_skip } from '../utils/db-helpers';

/** Class representing an Users model. */
export default new class UsersModel {

    /**
     * Create an Users model.
     */
    constructor() {
        this._dbContext = dbConfig;

        // Creating a reusable ColumnSet for all updates:
        this._updateUserCS = new  this._dbContext.pgp.helpers.ColumnSet([
            column_with_skip('nickname'), column_with_skip('about'),
            column_with_skip('fullname'), column_with_skip('email')
            ], {table: 'users'});
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
            result.data = await this._dbContext.db.one(createUserQuery);
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
            return await this._dbContext.db.manyOrNone(getUserQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async getUserByNickname(nickname) {
        try {
            const getUserQuery = new PQ(`SELECT * FROM users WHERE nickname = $1`, [nickname]);
            return await this._dbContext.db.oneOrNone(getUserQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async updateUser(nickname, userData) {
        try {
            let updateUserQuery = this._dbContext.pgp.helpers.update(userData, this._updateUserCS,
                null, {emptyUpdate: true});
            if (updateUserQuery === true) {
                return true;
            } else {
                updateUserQuery += " WHERE \"nickname\" = \'" +  nickname + "\' RETURNING *";
            }
            console.log('updateUserQuery: ', updateUserQuery);
            return await this._dbContext.db.oneOrNone(updateUserQuery);
        }
        catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

}