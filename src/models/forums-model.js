/**
 * Users model.
 * @module models/users-model
 */

import dbConfig from '../db-config';
const PQ = require('pg-promise').ParameterizedQuery;

/** Class representing an Forums model. */
export default new class ForumsModel {

    /**
     * Create an Users model.
     */
    constructor() {
        this._dbContext = dbConfig.db;
    }

    async createForum(forumData, userData) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const createForumQuery = new PQ(`INSERT INTO forums (slug, title, user_id, user_nickname) 
                VALUES ($1, $2, $3, $4) RETURNING *`);
            createForumQuery.values = [forumData.slug, forumData.title, userData.id, userData.nickname];
            result.data = await this._dbContext.one(createForumQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    async getForumBySlug(slug) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const getForumQuery = new PQ(`SELECT * FROM forums WHERE slug = $1`, [slug]);
            result.data = await this._dbContext.oneOrNone(getForumQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

}