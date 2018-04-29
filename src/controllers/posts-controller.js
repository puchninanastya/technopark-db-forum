import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';
import threadsModel from '../models/threads-model';
import postsModel from '../models/posts-model';

import postsSerializer from '../serializers/posts-serializers';
import threadsSerializer from '../serializers/threads-serializers';

export default new class PostsController {

    async getPostDetails(req, res) {
        let postId = req.params['id'];

        let existingPost = await postsModel.getPostById(postId);
        if (!existingPost) {
            return res.status(404).json({message: "Can't find post with id " + postId});
        }

        let result = {};
        result.post = postsSerializer.serialize_post(existingPost);
        if (req.query['related']) {
            for (let related of req.query['related'].split(',')) {
                switch (related) {
                    case 'user':
                        result.author = await usersModel.getUserById(existingPost.author_id);
                        break;
                    case 'thread':
                        result.thread = threadsSerializer.serialize_thread
                        (await threadsModel.getThreadById(existingPost.thread_id));
                        break;
                    case 'forum':
                        result.forum = await forumsModel.getForumById(existingPost.forum_id);
                        result.forum.user = result.forum.owner_nickname;
                        break;
                }
            }
        }

        res.json(result);
    }

    async updatePostDetails(req, res) {
        let postId = req.params['id'];

        let existingPost = await postsModel.getPostById(postId);
        if (!existingPost) {
            return res.status(404).json({message: "Can't find post with id " + postId});
        }

        if (!req.body.message || req.body.message === existingPost.message) {
            return res.json(postsSerializer.serialize_post(existingPost));
        }

        let updatedPost = await postsModel.updatePost(postId, req.body);
        if (!updatedPost.isSuccess) {
            return res.status(500).json({ message: "Can't change post with id " + postId });
        }

        res.json(postsSerializer.serialize_post(updatedPost.data));
    }

}