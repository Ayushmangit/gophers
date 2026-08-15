import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router"
import { Search, UserRound, X } from "lucide-react"

import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { getFeed } from "../../app/features/post/postThunk"
import { clearSearchResults } from "../../app/features/user/userSlice"
import { searchUsers } from "../../app/features/user/userThunk"

export default function Home() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const limit = 20

  const {
    searchResults,
    searchLoading,
  } = useAppSelector(
    (state) => state.users
  )

  const {
    posts,
    loading,
    error,
    loadingMore,
    hasMore
  } = useAppSelector(
    (state) => state.posts
  )

  const user = useAppSelector(
    (state) => state.auth.userData
  )

  /*
   * Search users
   */

  useEffect(() => {
    if (!searchQuery.trim()) {
      dispatch(clearSearchResults())
      return
    }

    const timeout = setTimeout(() => {
      dispatch(searchUsers(searchQuery.trim()))
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery, dispatch])

  /*
   * Get user's feed
   */

  useEffect(() => {
    dispatch(
      getFeed({
        limit,
        offset: 0,
        sort: "desc",
      })
    )
  }, [dispatch])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (
          entry.isIntersecting &&
          !loading &&
          !loadingMore &&
          hasMore
        ) {
          dispatch(
            getFeed({
              limit: 20,
              offset: posts.length,
            })
          )
        }
      },
      {
        rootMargin: "300px",
      }
    )

    const element = loadMoreRef.current

    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [
    dispatch,
    posts.length,
    loading,
    loadingMore,
    hasMore,
  ])

  function openSearch() {
    setSearchOpen(true)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery("")
    dispatch(clearSearchResults())
  }

  function handleUserClick(userId: number) {
    closeSearch()
    navigate(`/profile/${userId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">

          {/* Brand */}

          <Link
            to="/home"
            className="text-xl font-extrabold tracking-tight text-gray-900"
          >
            Home
          </Link>

          {/* Actions */}

          <div className="flex items-center gap-3">


            {/* Search */}

            <div className="relative">

              {!searchOpen ? (

                <button
                  onClick={openSearch}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                  title="Search"
                >
                  <Search size={20} />
                </button>

              ) : (

                <div className="flex items-center gap-2">

                  <div className="relative">

                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      placeholder="Search users..."
                      className="h-10 w-64 rounded-full border border-gray-200 bg-gray-100 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white"
                    />


                    {/* Search Dropdown */}

                    {searchQuery.trim() && (

                      <div className="absolute left-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

                        {/* Loading */}

                        {searchLoading && (

                          <div className="px-4 py-4 text-sm text-gray-500">

                            <div className="flex items-center gap-3">

                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />

                              <span>
                                Searching...
                              </span>

                            </div>

                          </div>

                        )}

                        {/* No results */}

                        {!searchLoading &&
                          searchResults.length === 0 && (

                            <div className="px-4 py-4 text-sm text-gray-500">
                              No users found
                            </div>

                          )}

                        {/* Results */}

                        {!searchLoading &&
                          searchResults.length > 0 && (

                            <div className="py-2">

                              {searchResults.map(
                                (searchUser) => (

                                  <button
                                    key={searchUser.id}
                                    onClick={() =>
                                      handleUserClick(
                                        searchUser.id
                                      )
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                                  >

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                      <UserRound
                                        size={19}
                                      />
                                    </div>

                                    <div className="min-w-0">

                                      <p className="truncate text-sm font-semibold text-gray-900">
                                        @
                                        {
                                          searchUser.username
                                        }
                                      </p>

                                      {searchUser.email && (

                                        <p className="truncate text-xs text-gray-400">
                                          {
                                            searchUser.email
                                          }
                                        </p>

                                      )}

                                    </div>

                                  </button>

                                )
                              )}

                            </div>

                          )}

                      </div>

                    )}

                  </div>

                  <button
                    onClick={closeSearch}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                    title="Close search"
                  >
                    <X size={19} />
                  </button>

                </div>

              )}

            </div>

            {/* Explore */}

            <Link
              to="/explore"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Explore
            </Link>

            {/* Create Post */}

            <Link
              to="/posts/create"
              className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Create Post
            </Link>

            {/* Profile */}

            {user && (

              <Link
                to={`/profile/${user.id}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200"
                title="Profile"
              >
                <UserRound size={20} />
              </Link>

            )}

          </div>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-3xl px-4 py-10">

        {/* Heading */}

        <div className="mb-8">

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Your Feed
          </h1>

          <p className="mt-2 text-gray-500">
            See what the people you follow are sharing.
          </p>

        </div>

        {/* ================= LOADING ================= */}

        {loading && (

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

            <p className="mt-4 text-gray-500">
              Loading your feed...
            </p>

          </div>

        )}

        {/* ================= ERROR ================= */}

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
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>

        )}

        {/* ================= EMPTY ================= */}

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
                Follow some people to see their posts here,
                or create your own post.
              </p>

              <Link
                to="/posts/create"
                className="mt-6 inline-block rounded-full bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                Create Your First Post
              </Link>

            </div>

          )}

        {/* ================= POSTS ================= */}

        {!loading &&
          !error &&
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

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                        <UserRound size={20} />
                      </div>

                      <div>

                        <p className="font-semibold text-gray-900 transition hover:text-blue-600">
                          @{post.user.username}
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

                  {/* Content */}

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

                  {post.tags.length > 0 && (

                    <div className="mt-5 flex flex-wrap gap-2">

                      {post.tags.map((tag) => (

                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600"
                        >
                          #{tag}
                        </span>

                      ))}

                    </div>

                  )}

                  {/* Footer */}

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">

                    <Link
                      to={`/posts/${post.id}`}
                      className="text-sm font-semibold text-gray-500 transition hover:text-gray-900"
                    >
                      {post.comment_count === 1
                        ? "1 comment"
                        : `${post.comment_count} comments`}
                    </Link>

                    <Link
                      to={`/posts/${post.id}`}
                      className="text-sm font-semibold text-gray-500 transition hover:text-gray-900"
                    >
                      Read post →
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          )}

        <div
          ref={loadMoreRef}
          className="flex min-h-24 items-center justify-center"
        >

          {/* Loading next page */}

          {loadingMore && (
            <div className="flex items-center gap-3 text-sm text-gray-500">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

              <span>
                Loading more posts...
              </span>

            </div>
          )}

          {/* No more posts */}

          {!loadingMore && !hasMore && (
            <p className="text-sm text-gray-400">
              You've reached the end.
            </p>
          )}

        </div>

      </main>

    </div>
  )
}
