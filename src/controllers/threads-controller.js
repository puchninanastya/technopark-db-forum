import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';
import threadsModel from '../models/threads-model';
import postsModel from '../models/posts-model';
import votesModel from '../models/votes-model';

import postsSerializer from "../serializers/posts-serializers";
import threadsSerializer from "../serializers/threads-serializers";

export default new class ThreadsController {

    async createPostsForThread(req, res) {
        let postsData = req.body;

        if (Array.isArray(postsData) && !postsData.length) {
            return res.status(201).json(postsData);
        } else if (!Array.isArray(postsData)) {
            return res.status(400).json({message: "Request data must be an array."});
        }

        let thread;
        if (/^\d+$/.test(req.params['slug_or_id'])) {
            thread = await threadsModel.getThreadById(Number(req.params['slug_or_id']));
        } else {
            thread = await threadsModel.getThreadBySlug(req.params['slug_or_id']);
        }
        thread.id = Number(thread.id);
        console.log('thread: ', thread);

        console.log('POSTS DATA: ', postsData);
        let postsResult = [];

        let createdDatetime = new Date();

        for (let postData of postsData) {

            // TODO: add transaction, add batch query ?

            let user = await usersModel.getUserByNickname(postData.author);
            if (!user) {
                return res.status(404).json({message: "Can't find user with nickname " + postData.author});
            }
            console.log('user: ', user);


            postData['created'] = createdDatetime;
            console.log('post data: ', postData);

            let createPostResult = await postsModel.createPost(postData, thread, user);
            console.log('createPostResult', createPostResult);
            if (createPostResult.isSuccess) {
                postsResult.push(createPostResult.data);
            } else {
                return res.status(400).end();
            }
            console.log('posts result now: ', postsResult);
        }

        console.log('posts RESULT: ', postsResult);
        res.status(201).json(postsSerializer.serialize_posts(postsResult));
    }

    async createOrUpdateVoteForThread(req, res) {
        let voteData = req.body;

        let user = await usersModel.getUserByNickname(voteData.nickname);
        if (!user) {
            return res.status(404).json({message: "Can't find user with nickname " + voteData.nickname});
        }

        let thread;
        if (/^\d+$/.test(req.params['slug_or_id'])) {
            thread = await threadsModel.getThreadById(Number(req.params['slug_or_id']));
        } else {
            thread = await threadsModel.getThreadBySlug(req.params['slug_or_id']);
        }
        if (!thread) {
            return res.status(404).json({message: "Can't find forum with slug or id " + req.params['slug_or_id']});
        }
        thread.id = Number(thread.id);

        let voteResult = await votesModel.createOrUpdateVote(voteData.voice, user, thread);
        if (!voteResult.isSuccess) {
            return res.status(400).json({message: voteResult.message});
        } else if (!voteResult.data) {
            return res.status(200).json(threadsSerializer.serialize_thread(thread));
        }

        let voiceValue = voteResult.data.voice;
        if (voteResult.data.existed) {
            voiceValue = voiceValue == 1 ? voiceValue + 1 : voiceValue - 1;
        }

        let updateThreadResult = await threadsModel.updateThreadVotes(thread, voiceValue);
        if (voteResult.isSuccess) {
            return res.status(200).json(threadsSerializer.serialize_thread(updateThreadResult.data));
        }

        res.status(500).end();
    }

    async getThreadDetails(req, res) {

        let thread;
        if (/^\d+$/.test(req.params['slug_or_id'])) {
            thread = await threadsModel.getThreadById(Number(req.params['slug_or_id']));
        } else {
            thread = await threadsModel.getThreadBySlug(req.params['slug_or_id']);
        }

        if (!thread) {
            return res.status(404).json({message: "Can't find forum with slug or id " + req.params['slug_or_id']});
        }
        res.json(threadsSerializer.serialize_thread(thread));
    }

    async getThreadPosts(req, res) {
        let getParams = [];
        getParams['limit'] = req.query.limit ? parseInt(req.query.limit) : 100;
        console.log('get params for get thread posts: ', getParams);

        let thread;
        if (/^\d+$/.test(req.params['slug_or_id'])) {
            thread = await threadsModel.getThreadById(Number(req.params['slug_or_id']));
        } else {
            thread = await threadsModel.getThreadBySlug(req.params['slug_or_id']);
        }

        if (!thread) {
            return res.status(404).json({message: "Can't find forum with slug or id " + req.params['slug_or_id']});
        }

        let postsResult;
        switch (req.query.sort) {
            case 'tree':
                console.log('TREE SORT');
                postsResult = await postsModel.getPostsByThreadIdTree(thread.id, getParams);
                break;
            case 'parent-tree':
                return res.status(404).end();
            default:
                console.log('FLAT SORT');
                postsResult = await postsModel.getPostsByThreadIdFlat(thread.id, getParams);
        }
        res.json(postsSerializer.serialize_posts(postsResult));
    }

}