import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';
import threadsModel from '../models/threads-model';
import postsModel from '../models/posts-model';
import postsSerializer from "../serializers/posts-serializers";

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

            // TODO: add transaction, add batch query

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

}