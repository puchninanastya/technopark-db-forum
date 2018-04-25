/**
 * Forums model.
 * @module models/forums-model
 */

import dbConfig from '../db-config';
const PQ = require('pg-promise').ParameterizedQuery;

/** Class representing an Forums model. */
export default new class ForumsModel {

    /**
     * Create an Forums model.
     */
    constructor() {
        this._dbContext = dbConfig;
    }

    async createForum(forumData, userData) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const createForumQuery = new PQ(`INSERT INTO forums (slug, title, owner_id, owner_nickname) 
                VALUES ($1, $2, $3, $4) RETURNING *`);
            createForumQuery.values = [forumData.slug, forumData.title, userData.id, userData.nickname];
            result.data = await this._dbContext.db.one(createForumQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    async getForumBySlug(slug) {
        try {
            const getForumQuery = new PQ(`SELECT * FROM forums WHERE slug = $1`, [slug]);
            return await this._dbContext.db.oneOrNone(getForumQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async getForumIdBySlug(slug) {
        try {
            const getForumQuery = new PQ(`SELECT id FROM forums WHERE slug = $1`, [slug]);
            let forumQueryResult = await this._dbContext.db.oneOrNone(getForumQuery);
            return forumQueryResult['id'];
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

}