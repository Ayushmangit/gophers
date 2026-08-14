import { createSlice } from "@reduxjs/toolkit"
import type { Post } from "../../types/Posts"
import { getAllPosts } from "./exploreThunk"


interface ExploreState {
	posts: Post[]
	loading: boolean
	error: string | null
}

const initialState: ExploreState = {
	posts: [],
	loading: false,
	error: null,
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

			// =========================
			// GET ALL POSTS
			// =========================

			.addCase(getAllPosts.pending, (state) => {
				state.loading = true
				state.error = null
			})

			.addCase(
				getAllPosts.fulfilled,
				(state, action) => {
					state.loading = false
					state.posts = action.payload ?? []
				},
			)

			.addCase(
				getAllPosts.rejected,
				(state, action) => {
					state.loading = false
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
