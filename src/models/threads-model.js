/**
 * Threads model.
 * @module models/threads-model
 */

import dbConfig from '../db-config';
const PQ = require('pg-promise').ParameterizedQuery;

/** Class representing an Threads model. */
export default new class ThreadsModel {

    /**
     * Create an Threads model.
     */
    constructor() {
        this._dbContext = dbConfig;
    }

    async createThread(threadData, userData, forumData) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const createThreadQuery = new PQ(`INSERT INTO threads (
                slug,
                author_id, author_nickname,
                forum_id, forum_slug, 
                created, title, message) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`);
            createThreadQuery.values = [
                threadData.slug,
                userData.id, userData.nickname,
                forumData.id, forumData.slug,
                threadData.created, threadData.title, threadData.message];
            result.data = await this._dbContext.db.one(createThreadQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    async getThreadBySlug(slug) {
        try {
            const getThreadQuery = new PQ(`SELECT * FROM threads WHERE slug = $1`, [slug]);
            return await this._dbContext.db.oneOrNone(getThreadQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async getThreadsByForumSlug(forumSlug, getParams) {
        try {
            // pre-format WHERE conditions
            let whereCondition;
            if (getParams.since && getParams.desc) {
                whereCondition = this._dbContext.pgp.as.format(` WHERE forum_slug = $1
                AND created <= $2`, [forumSlug, getParams.since]);
            } else if (getParams.since && !getParams.desc) {
                whereCondition = this._dbContext.pgp.as.format(` WHERE forum_slug = $1
                AND created >= $2`, [forumSlug, getParams.since]);
            } else {
                whereCondition = this._dbContext.pgp.as.format(` WHERE forum_slug = $1`, [forumSlug]);
            }
            return await this._dbContext.db.manyOrNone(`SELECT * FROM threads $1:raw
                ORDER BY $2:raw LIMIT $3`, [
                    whereCondition.toString(),
                    (getParams.desc ? 'created DESC' : 'created ASC'),
                    getParams.limit]);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

}