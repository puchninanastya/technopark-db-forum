/**
 * Votes model.
 * @module models/votes-model
 */

import dbConfig from '../db-config';
const PQ = require('pg-promise').ParameterizedQuery;

/** Class representing an Votes model. */
export default new class VotesModel {

    /**
     * Create an Votes model.
     */
    constructor() {
        this._dbContext = dbConfig;
    }

    /**
     * Count all votes.
     * @return votes amount
     * @return empty object if no votes
     */
    async countAllVotes() {
        try {
            return await this._dbContext.db.one(`SELECT count(*) FROM votes`);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Truncate all votes.
     */
    async truncateAllVotes() {
        try {
            return await this._dbContext.db.none(`TRUNCATE votes CASCADE`);
        } catch (error) {
            console.log('ERROR: ', error.message || error);
        }
    }

    /**
     * Add new voice or update existing for thread from user.
     */
    async createOrUpdateVote(voice, user, thread) {
        let result = {
            isSuccess: false,
            message: '',
            data: null
        };
        try {
            const voteQuery = new PQ(`INSERT INTO votes as v 
                (nickname, thread, voice)
                VALUES ($1, $2, $3) 
                ON CONFLICT ON CONSTRAINT unique_vote DO
                UPDATE SET voice = $3 WHERE v.voice <> $3
                RETURNING *, (xmax::text::int > 0) as existed`);
            voteQuery.values = [user.nickname, thread.id, voice];
            result.data = await this._dbContext.db.oneOrNone(voteQuery);
            result.isSuccess = true;
        } catch (error) {
            result.message = error.message;
            console.log('ERROR: ', error.message || error);
        }
        return result;
    }

}