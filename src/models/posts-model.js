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
                created, message, parent)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`);
            console.log('thread data : ', thread );
            createPostQuery.values = [
                user.id, user.nickname, thread.forum_id, thread.forum_slug,
                thread.id, thread.slug, postData.created, postData.message,
                postData.parent ? postData.parent : null,];
            result.data = await this._dbContext.db.one(createPostQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    /**
     * Get posts by thread id flat sorted by created datetime.
     * @param threadId - thread's id to find thread's posts
     * @param getParams - additional params for getting threads (desc for sort, since datetime and search limit)
     * @return array of found posts if posts for thread with such id exist
     * @return empty array if no posts for thread with such slug
     */
    async getPostsByThreadIdFlat(threadId, getParams) {
        try {
            return await this._dbContext.db.manyOrNone(`SELECT * FROM posts WHERE thread_id = $1
                ORDER BY created, id LIMIT $2`, [
                threadId,
                getParams.limit]);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Get posts by thread id flat sorted by created datetime.
     * @param threadId - thread's id to find thread's posts
     * @param getParams - additional params for getting threads (desc for sort, since datetime and search limit)
     * @return array of found posts if posts for thread with such id exist
     * @return empty array if no posts for thread with such slug
     */
    async getPostsByThreadIdTree(threadId, getParams) {
        try {
            return await this._dbContext.db.manyOrNone(`SELECT * FROM posts WHERE thread_id = $1
                ORDER BY path_to_this_post LIMIT $2`, [
                threadId,
                getParams.limit]);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

}