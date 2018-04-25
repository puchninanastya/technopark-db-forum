import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';
import threadsModel from '../models/threads-model';

import threadsSerializer from '../serializers/threads-serializers';

export default new class ForumsController {

    async createForum(req, res) {
        let forumData = req.body;
        let ownerNickname = forumData.user;

        let user = await usersModel.getUserByNickname(ownerNickname);
        if (!user) {
            return res.status(404).json({message: "Can't find user with nickname " + ownerNickname});
        }

        let existingForum = await forumsModel.getForumBySlug(forumData.slug);
        if (existingForum) {
            return res.status(409).json(
                {slug: existingForum.slug, title: existingForum.title, user: existingForum.owner_nickname});
        }

        let createForumResult = await forumsModel.createForum(forumData, user);
        if (createForumResult.isSuccess) {
            res.status(201).json(
                {slug: createForumResult.data.slug, title: createForumResult.data.title,
                    user: createForumResult.data.owner_nickname});
        } else {
            res.status(500).end();
        }
    }

    async getForumDetails(req, res) {
        let slug = req.params['slug'];

        let existingForum = await forumsModel.getForumBySlug(slug);
        if (!existingForum) {
            return res.status(404).json({message: "Can't find forum with slug " + slug});
        }

        res.json({slug: existingForum.slug, title: existingForum.title, user: existingForum.owner_nickname});
    }

    async createThreadForForum(req, res) {
        let threadData = req.body;
        let authorNickname = threadData.author;
        let forumData = {slug: req.params['slug']};

        let user = await usersModel.getUserByNickname(authorNickname);
        if (!user) {
            return res.status(404).json({message: "Can't find user with nickname " + authorNickname});
        }

        let existingThread = await threadsModel.getThreadBySlug(threadData.slug);
        if (existingThread) {
            return res.status(409).json(existingThread);
        }

        forumData['id'] = await forumsModel.getForumIdBySlug(forumData.slug);
        if (!forumData.id) {
            return res.status(404).json({message: "Can't find forum with slug " + forumData.slug});
        }

        let createThreadResult = await threadsModel.createThread(threadData, user, forumData);
        if (createThreadResult.isSuccess) {
            res.status(201).json(threadsSerializer.serialize_thread(createThreadResult.data));
        } else {
            res.status(500).end();
        }
    }

    async getForumThreads(req, res) {
        let forumSlug = req.params['slug'];
        // additional query params
        let getParams = {};
        getParams['desc'] = req.query.desc === 'true';
        getParams['limit'] = req.query.limit ? parseInt(req.query.limit) : 100;
        getParams['since'] = req.query.since;

        let existingForum = await forumsModel.getForumBySlug(forumSlug);
        if (!existingForum) {
            return res.status(404).json({message: "Can't find forum with slug " + forumSlug});
        }

        let threads = await threadsModel.getThreadsByForumSlug(forumSlug, getParams);
        res.json(threadsSerializer.serialize_threads(threads));
    }
}