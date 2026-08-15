import { createSlice } from "@reduxjs/toolkit"
import {
	createComment,
	createPost,
	deletePost,
	getFeed,
	getPost,
	updatePost,
} from "./postThunk"

import type { Post } from "../../types/Posts.ts"

interface PostState {
	posts: Post[]
	currentPost: Post | null
	loading: boolean
	loadingMore: boolean
	hasMore: boolean
	error: string | null
}

const initialState: PostState = {
	posts: [],
	currentPost: null,
	loading: false,
	error: null,
	hasMore: true,
	loadingMore: false
}

const postSlice = createSlice({
	name: "posts",
	initialState,

	reducers: {
		clearPostError: (state) => {
			state.error = null
		},

		clearCurrentPost: (state) => {
			state.currentPost = null
		},
	},

	extraReducers: (builder) => {
		builder

			// =========================
			// GET FEED
			// =========================

			.addCase(getFeed.pending, (state, action) => {
				state.error = null
				if (action.meta.arg.offset === 0) {
					state.loading = true
				} else {
					state.loadingMore = true
				}
			})

			.addCase(
				getFeed.fulfilled,
				(state, action) => {
					const posts = action.payload ?? []
					state.loading = false
					state.loadingMore = false
					if (action.meta.arg.offset === 0) {
						state.posts = posts
					} else {
						state.posts.push(...posts)
					}
					state.hasMore = posts.length === 20
				},
			)

			.addCase(
				getFeed.rejected,
				(state, action) => {
					state.loading = false
					state.loadingMore = false
					state.error =
						action.payload ||
						"Failed to load feed"
				},
			)

			// =========================
			// GET POST
			// =========================

			.addCase(getPost.pending, (state) => {
				state.loading = true
				state.error = null
			})

			.addCase(
				getPost.fulfilled,
				(state, action) => {
					state.loading = false
					state.currentPost =
						action.payload
				},
			)

			.addCase(
				getPost.rejected,
				(state, action) => {
					state.loading = false
					state.error =
						action.payload ||
						"Failed to fetch post"
				},
			)

			// =========================
			// CREATE POST
			// =========================

			.addCase(createPost.pending, (state) => {
				state.loading = true
				state.error = null
			})

			.addCase(
				createPost.fulfilled,
				(state, action) => {
					state.loading = false
					state.posts.unshift(
						action.payload,
					)
				},
			)

			.addCase(
				createPost.rejected,
				(state, action) => {
					state.loading = false
					state.error =
						action.payload ||
						"Failed to create post"
				},
			)

			// =========================
			// DELETE POST
			// =========================

			.addCase(deletePost.pending, (state) => {
				state.loading = true
				state.error = null
			})

			.addCase(
				deletePost.fulfilled,
				(state, action) => {
					state.loading = false

					state.posts =
						state.posts.filter(
							(post) =>
								post.id !==
								action.payload,
						)

					if (
						state.currentPost?.id ===
						action.payload
					) {
						state.currentPost = null
					}
				},
			)

			.addCase(
				deletePost.rejected,
				(state, action) => {
					state.loading = false
					state.error =
						action.payload ||
						"Failed to delete post"
				},
			)

			// =========================
			// UPDATE POST
			// =========================

			.addCase(updatePost.pending, (state) => {
				state.loading = true
				state.error = null
			})

			.addCase(
				updatePost.fulfilled,
				(state, action) => {
					state.loading = false

					const index =
						state.posts.findIndex(
							(post) =>
								post.id ===
								action.payload.id,
						)

					if (index !== -1) {
						state.posts[index] =
							action.payload
					}

					if (
						state.currentPost?.id ===
						action.payload.id
					) {
						state.currentPost =
							action.payload
					}
				},
			)

			.addCase(
				updatePost.rejected,
				(state, action) => {
					state.loading = false
					state.error =
						action.payload ||
						"Failed to update post"
				},
			)

			// =========================
			// CREATE COMMENT
			// =========================

			.addCase(
				createComment.pending,
				(state) => {
					state.error = null
				},
			)

			.addCase(
				createComment.fulfilled,
				(state, action) => {
					const newComment = action.payload

					const post = state.posts.find(
						(post) => post.id === newComment.post_id
					)

					if (post) {
						// Ensure comments is an array
						if (!post.comments) {
							post.comments = []
						}

						post.comments.push(newComment)
						post.comment_count += 1
					}

					if (
						state.currentPost?.id ===
						newComment.post_id
					) {
						// Ensure comments is an array
						if (!state.currentPost.comments) {
							state.currentPost.comments = []
						}

						state.currentPost.comments.push(
							newComment
						)

						state.currentPost.comment_count += 1
					}
				}
			).addCase(
				createComment.rejected,
				(state, action) => {
					state.error =
						action.payload ||
						"Failed to create comment"
				},
			)
	},
})

export const {
	clearPostError,
	clearCurrentPost,
} = postSlice.actions

export default postSlice.reducer
