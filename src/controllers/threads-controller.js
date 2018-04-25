import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';
import threadsModel from '../models/threads-model';
import postsModel from '../models/posts-model';

export default new class ThreadsController {

    async createPost(req, res) {
        let postsData = req.body;
        let threadSlugOrId = req.params['slug_or_id'];

        res.status(500).end();
    }

}