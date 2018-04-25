export default new class ThreadsSerializer {

    serialize_thread(thread) {
        return {
            id: Number(thread.id), author: thread.author_nickname,
            slug: thread.slug,
            forum: thread.forum_slug, created: thread.created,
            title: thread.title, message: thread.message
        };
    }

    serialize_threads(threads) {
        return threads.map(function(thread) {
            return {
                id: Number(thread.id), author: thread.author_nickname,
                slug: thread.slug,
                forum: thread.forum_slug, created: thread.created,
                title: thread.title, message: thread.message
            };
        });
    }

};