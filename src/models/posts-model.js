/**
 * Posts model.
 * @module models/posts-model
 */

import dbConfig from '../db-config';
const PQ = require('pg-promise').ParameterizedQuery;

/** Class representing an Posts model. */
export default new class PostsModel {

    /**
     * Create an Posts model.
     */
    constructor() {
        this._dbContext = dbConfig;
    }

    /**
     * Add new post to thread.
     */
    async createPost(postData, thread, user) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const createPostQuery = new PQ(`INSERT INTO posts (
                author_id, author_nickname, forum_id, forum_slug, thread_id, thread_slug,
                created, message)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`);
            console.log('thread data : ', thread );
            createPostQuery.values = [
                user.id, user.nickname, thread.forum_id, thread.forum_slug,
                thread.id, thread.slug, postData.created, postData.message ];
            result.data = await this._dbContext.db.one(createPostQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

}