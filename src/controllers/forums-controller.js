import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';

export default new class ForumsController {

    async createForum(req, res) {
        let forumData = req.body;
        let nickname = forumData.user;

        let user = await usersModel.getUserByNickname(nickname);
        console.log('user: ', user);
        if (!user) {
            return res.status(404).json({message: "Can't find user with nickname " + nickname});
        }

        let existingForum = await forumsModel.getForumBySlug(forumData.slug);
        console.log('existing forum: ', existingForum);
        if (!existingForum) {
            return res.status(409).json(existingForum);
        }

        let createForumResult = await forumsModel.createForum(forumData, user);
        console.log('createForumResult: ', createForumResult);
        if (createForumResult.isSuccess) {
            res.status(201).json(forumData);
        } else {
            res.status(500).end();
        }
    }
}