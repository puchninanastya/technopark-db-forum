import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';
import threadsModel from '../models/threads-model';
import postsModel from '../models/posts-model';

import postsSerializer from '../serializers/posts-serializers';

export default new class PostsController {

    async getPostDetails(req, res) {
        let postId = req.params['id'];

        let existingPost = await postsModel.getPostById(postId);
        if (!existingPost) {
            return res.status(404).json({message: "Can't find post with id " + postId});
        }

        res.json(postsSerializer.serialize_post(existingPost, true));
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