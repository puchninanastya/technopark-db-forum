import forumsModel from '../models/forums-model';
import usersModel from '../models/users-model';
import threadsModel from '../models/threads-model';
import postsModel from '../models/posts-model';
import votesModel from '../models/votes-model';

export default new class ServiceController {

    async getServiceStatus(req, res) {

        let users = await usersModel.countAllUsers();
        let forums = await forumsModel.countAllForums();
        let threads = await threadsModel.countAllThreads();
        let posts = await postsModel.countAllPosts();

        res.json({  user: users ? Number(users.count)        : 0,
                    forum: forums ? Number(forums.count)     : 0,
                    thread: threads ? Number(threads.count)  : 0,
                    post: posts ? Number(posts.count)        : 0});
    }

    async clearAll(req, res) {

        await usersModel.truncateAllUsers();
        await forumsModel.truncateAllForums();
        await threadsModel.truncateAllThreads();
        await postsModel.truncateAllPosts();
        await votesModel.truncateAllVotes();

        res.end();
    }

}