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
    async createPost(postsData, threadData, userData, forumData) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        return result;
    }

}