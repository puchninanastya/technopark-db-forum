/**
 * Posts model.
 * @module models/posts-model
 */

import dbConfig from '../db-config';
import {column_with_skip} from "../utils/db-helpers";
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
     * Count all posts.
     * @return posts amount
     * @return empty object if no posts
     */
    async countAllPosts() {
        try {
            return await this._dbContext.db.one(`SELECT count(*) FROM posts`);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Truncate all posts.
     */
    async truncateAllPosts() {
        try {
            return await this._dbContext.db.none(`TRUNCATE posts CASCADE`);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
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
            // Check if parent post is in the same thread as new post
            if (postData.parent) {
                const getParentPostQuery = new PQ(`SELECT id FROM posts WHERE id = $1 AND thread_id = $2`);
                getParentPostQuery.values = [postData.parent, thread.id];
                let parentResult = await this._dbContext.db.oneOrNone(getParentPostQuery);
                if (!parentResult) {
                    result.message = '409';
                    return result;
                }
            }
            const createPostQuery = new PQ(`INSERT INTO posts (
                author_id, author_nickname, forum_id, forum_slug, thread_id, thread_slug,
                created, message, parent)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`);
            createPostQuery.values = [
                user.id, user.nickname, thread.forum_id, thread.forum_slug,
                thread.id, thread.slug, postData.created, postData.message,
                postData.parent ? postData.parent : null,];
            result.data = await this._dbContext.db.one(createPostQuery);
            // Add this user for forum's users table if not exists
            await this._dbContext.db.oneOrNone(`
            INSERT INTO forum_users (forum_id, user_id)
                VALUES ($1, $2)
                ON CONFLICT ON CONSTRAINT unique_user_in_forum DO NOTHING
                RETURNING *`,
                [thread.forum_id, user.id]);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

    /**
     * Get post by id.
     * @param id - post's id
     * @return post's object if post with such id exists
     * @return empty object if no posts with such id
     */
    async getPostById(id) {
        try {
            const getPostQuery = new PQ(`SELECT * FROM posts WHERE id = $1`, [id]);
            return await this._dbContext.db.oneOrNone(getPostQuery);
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
    async getPostsByThreadIdFlatSort(threadId, getParams) {
        try {
            let sinceSub;
            if (getParams.since) {
                sinceSub = getParams.desc ? 'AND id < ' + getParams.since : 'AND id > ' + getParams.since ;
            }
            return await this._dbContext.db.manyOrNone(`SELECT * FROM posts WHERE thread_id = $1 $5:raw
                ORDER BY $2:raw, $3:raw LIMIT $4`, [
                threadId,
                (getParams.desc ? 'created DESC' : 'created ASC'),
                (getParams.desc ? 'id DESC' : 'id ASC'),
                getParams.limit,
                (getParams.since ? sinceSub : '')]);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Get posts by thread id sorted as tree by path to post.
     * @param threadId - thread's id to find thread's posts
     * @param getParams - additional params for getting threads (desc for sort, since datetime and search limit)
     * @return array of found posts if posts for thread with such id exist
     * @return empty array if no posts for thread with such slug
     */
    async getPostsByThreadIdTreeSort(threadId, getParams) {
        try {
            let whereCondition;
            if (getParams.since && getParams.desc) {
                whereCondition = this._dbContext.pgp.as.format(` WHERE thread_id = $1
                AND path_to_this_post < (SELECT path_to_this_post FROM posts WHERE id = $2) `, [threadId, getParams.since]);
            } else if (getParams.since && !getParams.desc) {
                whereCondition = this._dbContext.pgp.as.format(` WHERE thread_id = $1
                AND path_to_this_post > (SELECT path_to_this_post FROM posts WHERE id = $2) `, [threadId, getParams.since]);
            } else {
                whereCondition = this._dbContext.pgp.as.format(` WHERE thread_id = $1 `, [threadId]);
            }
            return await this._dbContext.db.manyOrNone(`SELECT * FROM posts $1:raw
                ORDER BY $2:raw LIMIT $3`, [
                whereCondition.toString(),
                (getParams.desc ? 'path_to_this_post DESC' : 'path_to_this_post ASC'),
                getParams.limit]);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Get posts by thread id sorted as tree by path to post.
     * @param threadId - thread's id to find thread's posts
     * @param getParams - additional params for getting threads (desc for sort, since datetime and search limit)
     * @return array of found posts if posts for thread with such id exist
     * @return empty array if no posts for thread with such slug
     */
    async getPostsByThreadIdParentTreeSort(threadId, getParams) {
        try {
            let subWhereCondition;
            if (getParams.since && getParams.desc) {
                subWhereCondition = this._dbContext.pgp.as.format(` WHERE parent IS NULL 
                AND thread_id = $1  
                AND path_to_this_post[1] < (SELECT path_to_this_post[1] FROM posts WHERE id =  $2) `,
                    [threadId, getParams.since]);
            } else if (getParams.since && !getParams.desc) {
                subWhereCondition = this._dbContext.pgp.as.format(` WHERE parent IS NULL 
                AND thread_id = $1  
                AND path_to_this_post[1] > (SELECT path_to_this_post[1] FROM posts WHERE id =  $2) `,
                    [threadId, getParams.since]);
            } else {
                subWhereCondition = this._dbContext.pgp.as.format(` WHERE parent IS NULL 
                AND thread_id = $1  `, [threadId]);
            }
            return await this._dbContext.db.manyOrNone(`
                SELECT * FROM posts JOIN
                (SELECT id AS sub_parent_id FROM posts $1:raw ORDER BY $5:raw LIMIT $4 ) AS sub 
                ON (thread_id = $2 AND sub.sub_parent_id = path_to_this_post[1]) 
                ORDER BY $3:raw`, [
                subWhereCondition.toString(),
                threadId,
                (getParams.desc ? 'sub.sub_parent_id DESC, path_to_this_post ASC' : 'path_to_this_post ASC'),
                getParams.limit,
                (getParams.desc ? 'id DESC ' : 'id ASC'),]);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Update post.
     * @param id - post's id
     * @param postData - object of updated post data (may consist not of all fields)
     * @return updated post if successful query
     * @return error message if unsuccessful query
     */
    async updatePost(id, postData) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const updatePostQuery = new PQ(`UPDATE posts SET 
                message = $1, isEdited = True
                WHERE id = $2
                RETURNING *`);
            updatePostQuery.values = [postData.message, id];
            result.data = await this._dbContext.db.one(updatePostQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

}