/**
 * Threads serializer.
 * @module serializers/threads-serializer
 */

/** Class representing Threads serializer. */
export default new class ThreadsSerializer {

    /**
     * Serialize one thread object to API output format.
     * @param thread - object to serialize
     * @return serialized thread object
     */
    serialize_thread(thread) {
        return {
            id: Number(thread.id), author: thread.author_nickname,
            slug: thread.slug,
            forum: thread.forum_slug, created: thread.created,
            title: thread.title, message: thread.message,
            votes: thread.votes
        };
    }

    /**
     * Serialize array of threads to API output format.
     * @param threads - array of objects to serialize
     * @return array of serialized thread objects
     */
    serialize_threads(threads) {
        if (!threads.length) {
            return [];
        }
        return threads.map(function(thread) {
            return {
                id: Number(thread.id), author: thread.author_nickname,
                slug: thread.slug,
                forum: thread.forum_slug, created: thread.created,
                title: thread.title, message: thread.message,
                votes: thread.votes
            };
        });
    }

};