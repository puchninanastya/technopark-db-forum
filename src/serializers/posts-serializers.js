/**
 * Posts serializer.
 * @module serializers/posts-serializer
 */

/** Class representing Posts serializer. */
export default new class PostsSerializer {

    /**
     * Serialize one posts object to API output format.
     * @param post - object to serialize
     * @return serialized thread object
     */
    serialize_post(post) {
        return {
            id: Number(post.id), author: post.author_nickname,
            forum: post.forum_slug, thread: Number(post.thread_id),
            isEdited: post.isEdited,
            created: post.created, message: post.message
        };
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
            return {
                id: Number(post.id), author: post.author_nickname,
                forum: post.forum_slug, thread: Number(post.thread_id),
                isEdited: post.isEdited,
                created: post.created, message: post.message
            };
        });
    }

};