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

    /**
     * Add new forum.
     * @param forumData - object of forum data
     * @param userData - forum owner's user object
     * @return created forum if successful query
     * @return error message if unsuccessful query
     */
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

    /**
     * Get forum by slug.
     * @param slug - forum's slug (human-readable name for url)
     * @return forum's object if forum with such slug exists
     * @return empty object if no forums with such slug
     */
    async getForumBySlug(slug) {
        try {
            const getForumQuery = new PQ(`SELECT * FROM forums WHERE slug = $1`, [slug]);
            return await this._dbContext.db.oneOrNone(getForumQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Get forum id by slug.
     * @param slug - forum's slug (human-readable name for url)
     * @return forum's id if forum with such slug exists
     * @return undefined if no forums with such slug
     */
    async getForumIdBySlug(slug) {
        try {
            const getForumQuery = new PQ(`SELECT id FROM forums WHERE slug = $1`, [slug]);
            let forumQueryResult = await this._dbContext.db.oneOrNone(getForumQuery);
            return forumQueryResult['id'];
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async addPostsToForum(id, posts_num) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const updatePostsQuery = new PQ(`UPDATE forums SET 
                posts = posts + $1
                WHERE id = $2
                RETURNING *`);
            updatePostsQuery.values = [posts_num, id];
            result.data = await this._dbContext.db.one(updatePostsQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    async addThreadsToForum(id, threads_num = 1) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const updateThreadsQuery = new PQ(`UPDATE forums SET 
                threads = threads + $1
                WHERE id = $2
                RETURNING *`);
            updateThreadsQuery.values = [threads_num, id];
            result.data = await this._dbContext.db.one(updateThreadsQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

}