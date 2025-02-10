"use client";

import { useState, useEffect } from "react";

interface Reply {
  content: string;
  author: string;
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
  replies: Reply[];
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Fetch posts from the API
  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    }
    fetchPosts();
  }, []);

  // Submit a new post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author: "Anonymous" }),
    });

    if (res.ok) {
      const newPost = await res.json();
      setPosts((prev) => [
        { _id: newPost.insertedId, content, author: "Anonymous", createdAt: new Date().toISOString(), replies: [] },
        ...prev,
      ]);
      setContent("");
    }
  };

  // Submit a reply to a post
  const handleReplySubmit = async (postId: string) => {
    const reply = replyContent[postId];
    if (!reply) return;

    const res = await fetch("/api/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: reply, author: "Anonymous" }),
    });

    if (res.ok) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                replies: [
                  ...post.replies,
                  {
                    content: reply,
                    author: "Anonymous",
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : post
        )
      );

      setReplyContent((prev) => ({ ...prev, [postId]: "" }));
      setReplyingTo(null);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">
        The Chaos Network
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg mb-8">
        <textarea
          className="border border-gray-300 rounded-lg p-4 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Post
        </button>
      </form>

      <div className="w-full max-w-3xl">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post._id}
              className="border border-gray-200 p-6 rounded-lg mb-6 bg-white shadow-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
            >
              <p className="text-gray-800 text-lg">{post.content}</p>
              <small className="text-gray-500 mt-2 block">
                by {post.author} - {new Date(post.createdAt).toLocaleString()}
              </small>

              <button
                onClick={() => setReplyingTo(post._id)}
                className="mt-2 text-blue-600 hover:underline"
              >
                Reply
              </button>

              {replyingTo === post._id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                  <textarea
                    className="border border-gray-300 rounded-lg p-4 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a reply..."
                    value={replyContent[post._id] || ""}
                    onChange={(e) =>
                      setReplyContent((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    rows={3}
                  />
                  <button
                    onClick={() => handleReplySubmit(post._id)}
                    className="bg-blue-600 text-white p-2 rounded-lg"
                  >
                    Submit Reply
                  </button>
                </div>
              )}

              {post.replies && post.replies.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-bold text-xl">Replies:</h3>
                  <div className="space-y-2">
                    {post.replies.map((reply, index) => (
                      <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                        <p className="text-gray-800">{reply.content}</p>
                        <small className="text-gray-500">
                          by {reply.author} - {new Date(reply.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </main>
  );
}
