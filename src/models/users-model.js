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

    /**
     * Count all users.
     * @return users amount
     * @return empty object if no users
     */
    async countAllUsers() {
        try {
            return await this._dbContext.db.one(`SELECT count(*) FROM users`);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Truncate all users.
     */
    async truncateAllUsers() {
        try {
            return await this._dbContext.db.none(`TRUNCATE users CASCADE`);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Add new user.
     * @param nickname - user's nickname
     * @param userData - object of additional user data
     * @return created user if successful query
     * @return error message if unsuccessful query
     */
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

    /**
     * Get users by nickname or email.
     * @param nickname - user's nickname
     * @param email - user's email
     * @return array of found users if users with such email or nickname exist
     * @return empty array if no users with such email or nickname
     */
    async getUsersByNicknameOrEmail(nickname, email) {
        try {
            const getUserQuery = new PQ(`SELECT * FROM users WHERE nickname = $1 OR email = $2`);
            getUserQuery.values = [nickname, email];
            return await this._dbContext.db.manyOrNone(getUserQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Get user by nickname.
     * @param nickname - user's nickname
     * @return user's object if user with such nickname exists
     * @return empty object if no users with such nickname
     */
    async getUserByNickname(nickname) {
        try {
            const getUserQuery = new PQ(`SELECT * FROM users WHERE nickname = $1`, [nickname]);
            return await this._dbContext.db.oneOrNone(getUserQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Get users that created posts in forum.
     * @param forum_id - forum's id, where to find users
     * @param getParams - additional params for getting users (desc for sort, since datetime and search limit)
     * @return array of found users that created posts in forum with such id
     * @return empty array if no users posts in forum with such id
     */
    async getUsersFromForum(forum_id, getParams) {
        try {
            // pre-format WHERE conditions
            let whereCondition;
            if (getParams.since && getParams.desc) {
                whereCondition = this._dbContext.pgp.as.format(` WHERE id IN 
                (SELECT user_id FROM forum_users WHERE forum_id = $1)
                AND nickname < $2 `, [forum_id, getParams.since]);
            } else if (getParams.since && !getParams.desc) {
                whereCondition = this._dbContext.pgp.as.format(`WHERE id IN 
                (SELECT user_id FROM forum_users WHERE forum_id = $1)
                AND nickname > $2 `, [forum_id, getParams.since]);
            } else {
                whereCondition = this._dbContext.pgp.as.format(` WHERE id IN 
                (SELECT user_id FROM forum_users WHERE forum_id = $1)`, [forum_id]);
            }
            return await this._dbContext.db.manyOrNone(`
                SELECT id, about, email, fullname, nickname 
                FROM users $1:raw 
                ORDER BY $2:raw LIMIT $3`,
                [whereCondition.toString(),
                (getParams.desc ? 'nickname DESC' : 'nickname ASC'),
                getParams.limit]);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Update user data.
     * @param nickname - user's nickname
     * @param userData - object of additional user data (may consist not of all fields)
     * @return updated user if successful query
     * @return error message if unsuccessful query
     */
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