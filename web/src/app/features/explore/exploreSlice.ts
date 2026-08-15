import { createSlice } from "@reduxjs/toolkit"
import type { Post } from "../../types/Posts"
import { getAllPosts } from "./exploreThunk"


interface ExploreState {
	posts: Post[]
	loading: boolean
	error: string | null
	hasMore: boolean
	loadingMore: boolean
}

const initialState: ExploreState = {
	posts: [],
	loading: false,
	loadingMore: false,
	error: null,
	hasMore: true
}

const exploreSlice = createSlice({
	name: "explore",

	initialState,

	reducers: {
		clearExploreError: (state) => {
			state.error = null
		},

		clearExplorePosts: (state) => {
			state.posts = []
		},
	},

	extraReducers: (builder) => {
		builder

			.addCase(getAllPosts.pending, (state, action) => {
				state.error = null

				if (action.meta.arg.offset === 0) {
					state.loading = true;
				} else {
					state.loadingMore = true;
				}
			})

			.addCase(
				getAllPosts.fulfilled,
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
				getAllPosts.rejected,
				(state, action) => {
					state.loading = false
					state.loadingMore = false
					state.error =
						action.payload ||
						"Failed to load explore posts"
				},
			)
	},
})

export const {
	clearExploreError,
	clearExplorePosts,
} = exploreSlice.actions

export default exploreSlice.reducer
