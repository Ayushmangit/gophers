import { useState } from "react";

export default function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleShare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/v1/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJHb3BoZXJzb2NpYWwiLCJleHAiOjE3ODYyNzUyOTgsImlhdCI6MTc4NjAxNjA5OCwiaXNzIjoiR29waGVyc29jaWFsIiwibmFmIjoxNzg2MDE2MDk4LCJzdWIiOjEyNX0.LW1PERC_fkjX4iNPwMu0Mwc0LgnuBL5fq4cl1TYFtPI`, // if required
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create post");
      }

      const data = await res.json();
      console.log(data);

      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex justify-center px-4 py-10 bg-gray-100 min-h-screen">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create a Post
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Share your thoughts with everyone.
        </p>

        <form onSubmit={handleShare} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>

            <input
              type="text"
              placeholder="Give your post a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Content
            </label>

            <textarea
              rows={6}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
            >
              Share Post 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
