/**
 * Threads model.
 * @module models/threads-model
 */

import dbConfig from '../db-config';
import {column_with_skip} from "../utils/db-helpers";
const PQ = require('pg-promise').ParameterizedQuery;

/** Class representing an Threads model. */
export default new class ThreadsModel {

    /**
     * Create an Threads model.
     */
    constructor() {
        this._dbContext = dbConfig;

        // Creating a reusable ColumnSet for all updates:
        this._updateThreadCS = new  this._dbContext.pgp.helpers.ColumnSet([
            column_with_skip('message'), column_with_skip('title')
        ], {table: 'threads'});
    }

    /**
     * Add new thread to forum.
     * @param threadData - object of thread data
     * @param user - thread's author object
     * @param forum - object of thread's forum with id and slug fields
     * @return created thread if successful query
     * @return error message if unsuccessful query
     */
    async createThread(threadData, user, forum) {
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
                user.id, user.nickname,
                forum.id, forum.slug,
                threadData.created, threadData.title, threadData.message];
            result.data = await this._dbContext.db.one(createThreadQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    /**
     * Get thread by id.
     * @param id - thread's id
     * @return thread's object if thread with such id exists
     * @return empty object if no threads with such id
     */
    async getThreadById(id) {
        try {
            const getThreadQuery = new PQ(`SELECT * FROM threads WHERE id = $1`, [id]);
            return await this._dbContext.db.oneOrNone(getThreadQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Get thread by slug.
     * @param slug - thread's slug (human-readable name for url)
     * @return thread's object if thread with such slug exists
     * @return empty object if no threads with such slug
     */
    async getThreadBySlug(slug) {
        try {
            const getThreadQuery = new PQ(`SELECT * FROM threads WHERE slug = $1`, [slug]);
            return await this._dbContext.db.oneOrNone(getThreadQuery);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    async updateThread(id, threadData) {
        try {
            let updateThreadQuery = this._dbContext.pgp.helpers.update(threadData, this._updateThreadCS,
                null, {emptyUpdate: true});
            if (updateThreadQuery === true) {
                return true;
            } else {
                updateThreadQuery += " WHERE \"id\" = \'" +  id + "\' RETURNING *";
            }
            console.log('updateThreadQuery: ', updateThreadQuery);
            return await this._dbContext.db.oneOrNone(updateThreadQuery);
        }
        catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }


    /**
     * Get threads by forum slug.
     * @param forumSlug - forum's slug to find forum's threads
     * @param getParams - additional params for getting threads (desc for sort, since datetime and search limit)
     * @return array of found threads if threads for forum with such slug exist
     * @return empty array if no threads for forum with such slug
     */
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

    /**
     * Update votes for thread.
     */
    async updateThreadVotes(thread, voiceValue) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const updateVotesQuery = new PQ(`UPDATE threads SET 
                votes = votes + $1
                WHERE id = $2
                RETURNING *`);
            updateVotesQuery.values = [voiceValue, thread.id];
            result.data = await this._dbContext.db.one(updateVotesQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

}