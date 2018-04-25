import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';
import threadsModel from '../models/threads-model';

export default new class ForumsController {

    async createForum(req, res) {
        let forumData = req.body;
        let ownerNickname = forumData.user;

        let user = await usersModel.getUserByNickname(ownerNickname);
        console.log('user: ', user);
        if (!user) {
            return res.status(404).json({message: "Can't find user with nickname " + ownerNickname});
        }

        let existingForum = await forumsModel.getForumBySlug(forumData.slug);
        console.log('existing forum: ', existingForum);
        if (existingForum) {
            return res.status(409).json(
                {slug: existingForum.slug, title: existingForum.title, user: existingForum.owner_nickname});
        }

        let createForumResult = await forumsModel.createForum(forumData, user);
        console.log('createForumResult: ', createForumResult);
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
        console.log('existing forum: ', existingForum);
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
        console.log('user: ', user);
        if (!user) {
            return res.status(404).json({message: "Can't find user with nickname " + authorNickname});
        }

        let existingThread = await threadsModel.getThreadBySlug(threadData.slug);
        console.log('existing thread: ', existingThread);
        if (existingThread) {
            return res.status(409).json(existingThread);
        }

        forumData['id'] = await forumsModel.getForumIdBySlug(forumData.slug);
        if (!forumData.id) {
            return res.status(404).json({message: "Can't find forum with slug " + forumData.slug});
        }

        let createThreadResult = await threadsModel.createThread(threadData, user, forumData);
        console.log('createThreadResult: ', createThreadResult);
        if (createThreadResult.isSuccess) {
            res.status(201).json({
                id: Number(createThreadResult.data.id), author: createThreadResult.data.author_nickname,
                slug: createThreadResult.data.slug,
                forum: createThreadResult.data.forum_slug, created: createThreadResult.data.created,
                title: createThreadResult.data.title, message: createThreadResult.data.message});
        } else {
            res.status(500).end();
        }
    }
}