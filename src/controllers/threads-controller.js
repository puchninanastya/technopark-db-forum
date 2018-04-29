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

        let postsResult = [];
        let createdDatetime = new Date();
        for (let postData of postsData) {
            // TODO: add transaction, add batch query ?
            let user = await usersModel.getUserByNickname(postData.author);
            if (!user) {
                return res.status(404).json({message: "Can't find user with nickname " + postData.author});
            }

            postData['created'] = createdDatetime;

            let createPostResult = await postsModel.createPost(postData, thread, user);
            if (createPostResult.isSuccess) {
                postsResult.push(createPostResult.data);
            } else {
                return res.status(400).end();
            }
        }

        if (postsData.length > 0) {
            let addPostsResult = await forumsModel.addPostsToForum(thread.forum_id, postsData.length);
            console.log('addPostsResult: ', addPostsResult);
            if (!addPostsResult.isSuccess) {
                return res.status(500).end();
            }
        }

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

    async updateThreadDetails(req, res) {
        let newThreadData = req.body;

        let thread;
        if (/^\d+$/.test(req.params['slug_or_id'])) {
            thread = await threadsModel.getThreadById(Number(req.params['slug_or_id']));
        } else {
            thread = await threadsModel.getThreadBySlug(req.params['slug_or_id']);
        }

        if (!thread) {
            return res.status(404).json({message: "Can't find forum with slug or id " + req.params['slug_or_id']});
        }

        console.log('thread exists');
        let updatedThread = await threadsModel.updateThread(thread.id, newThreadData);
        console.log('updated thread res: ', updatedThread);

        if (!updatedThread) {
            console.log('thread no if');
            return res.status(409).json({ message: "Can't change thread with id " + id });
        }

        console.log('OK updated');
        if (updatedThread === true) {
            console.log('in empty update');
            res.json(threadsSerializer.serialize_thread(thread));
        } else {
            console.log('in ok update');
            res.json(threadsSerializer.serialize_thread(updatedThread));
        }

    }

    async getThreadPosts(req, res) {
        let getParams = [];
        getParams['desc'] = req.query.desc === 'true';
        getParams['limit'] = req.query.limit ? parseInt(req.query.limit) : 100;
        getParams['since'] = Number(req.query.since);
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
        console.log('SORT PARAM: ', req.query.sort);
        switch (req.query.sort) {
            case 'tree':
                console.log('TREE SORT');
                postsResult = await postsModel.getPostsByThreadIdTreeSort(thread.id, getParams);
                break;
            case 'parent_tree':
                console.log('PARENT TREE SORT');
                postsResult = await postsModel.getPostsByThreadIdParentTreeSort(thread.id, getParams);
                break;
            default:
                console.log('FLAT SORT');
                postsResult = await postsModel.getPostsByThreadIdFlatSort(thread.id, getParams);
        }
        res.json(postsSerializer.serialize_posts(postsResult));
    }

}