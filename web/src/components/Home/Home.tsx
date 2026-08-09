import { useEffect } from "react"
import { Link } from "react-router"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { getFeed } from "../../app/features/post/postThunk"
import { logoutUser } from "../../app/features/auth/authThunk"

export default function Home() {

  const dispatch = useAppDispatch()

  function handleLogout() {
    dispatch(logoutUser())
  }

  const {
    posts,
    loading,
    error,
  } = useAppSelector(
    (state) => state.posts
  )

  const user = useAppSelector(
    (state) => state.auth.userData
  )

  useEffect(() => {
    dispatch(
      getFeed({
        limit: 20,
        offset: 0,
        sort: "desc",
      })
    )
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          {/* Logo */}

          <Link
            to="/home"
            className="text-2xl font-extrabold tracking-tight text-gray-900"
          >
            Gopher Social
          </Link>

          {/* Navigation */}

          <div className="flex items-center gap-3">
            <Link
              to="/posts/create"
              className="rounded-xl bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Post
            </Link>

            <Link to={"/login"} onClick={handleLogout}>Logout</Link>

            {user && (
              <Link
                to={`/profile/${user.id}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700 transition hover:bg-gray-300"
                title="Profile"
              >
                {user.username
                  .charAt(0)
                  .toUpperCase()}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main */}

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Page heading */}

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Your Feed
          </h1>

          <p className="mt-2 text-gray-500">
            See what the people you follow
            are sharing.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />

            <p className="mt-4 text-gray-500">
              Loading your feed...
            </p>
          </div>
        )}

        {/* Error */}

        {error && !loading && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-bold text-red-700">
              Unable to load your feed
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() =>
                dispatch(
                  getFeed({
                    limit: 20,
                    offset: 0,
                    sort: "desc",
                  })
                )
              }
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty feed */}

        {!loading &&
          !error &&
          posts.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                ✍️
              </div>

              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                Your feed is empty
              </h2>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                Follow some people to see
                their posts here, or create
                your own post.
              </p>

              <Link
                to="/posts/create"
                className="mt-6 inline-block rounded-xl bg-gray-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Create Your First Post
              </Link>
            </div>
          )}

        {/* Posts */}

        {!loading &&
          posts.length > 0 && (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* Author */}

                  <div className="flex items-center justify-between">
                    <Link
                      to={`/profile/${post.user_id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700">
                        {post.user.username
                          .charAt(
                            0
                          )
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 hover:text-blue-600">
                          @
                          {
                            post
                              .user
                              .username
                          }
                        </p>

                        <p className="text-xs text-gray-400">
                          {new Date(
                            post.created_at
                          ).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Post content */}

                  <Link
                    to={`/posts/${post.id}`}
                    className="block"
                  >
                    <h2 className="mt-6 text-2xl font-bold text-gray-900 transition hover:text-gray-600">
                      {post.title}
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-600">
                      {post.content}
                    </p>
                  </Link>

                  {/* Tags */}

                  {post.tags.length >
                    0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {post.tags.map(
                          (
                            tag
                          ) => (
                            <span
                              key={
                                tag
                              }
                              className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600"
                            >
                              #
                              {
                                tag
                              }
                            </span>
                          )
                        )}
                      </div>
                    )}

                  {/* Footer */}

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <Link
                      to={`/posts/${post.id}`}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-900"
                    >
                      {post.comment_count ===
                        1
                        ? "1 comment"
                        : `${post.comment_count} comments`}
                    </Link>

                    <Link
                      to={`/posts/${post.id}`}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-900"
                    >
                      Read post →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
      </main>
    </div>
  )
}
