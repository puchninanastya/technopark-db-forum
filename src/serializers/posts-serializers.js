/**
 * Posts serializer.
 * @module serializers/posts-serializer
 */

/** Class representing Posts serializer. */
export default new class PostsSerializer {

    /**
     * Serialize one posts object to API output format.
     * @param post - object to serialize
     * @return Object - serialized post object
     */
    serialize_post(post, showAsDetail = false) {
        let postResult = {
            id: Number(post.id), author: post.author_nickname,
            forum: post.forum_slug, thread: Number(post.thread_id),
            isEdited: post.isedited,
            created: post.created, message: post.message
        };
        if (post.parent !== post.id) {
            postResult.parent = Number(post.parent);
            postResult.path = post.path_to_this_post;
        }
        if (showAsDetail) {
            postResult = {post: postResult};
        }
        return postResult;
    }

    /**
     * Serialize array of posts to API output format.
     * @param posts - array of objects to serialize
     * @return array of serialized post objects
     */
    serialize_posts(posts) {
        if (!posts.length) {
            return [];
        }
        return posts.map(function(post) {
            let postResult = {
                id: Number(post.id), author: post.author_nickname,
                forum: post.forum_slug, thread: Number(post.thread_id),
                isEdited: post.isEdited,
                created: post.created, message: post.message
            };
            if (post.parent !== post.id) {
                postResult.parent = Number(post.parent);
                postResult.path_to_this_post = post.path_to_this_post;
            }
            return postResult;
        });
    }

};