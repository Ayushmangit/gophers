// src/features/users/userSlice.ts

import { createSlice } from "@reduxjs/toolkit"
import type { User } from "../../types/User.ts"
import {
	getUser,
	followUser,
	unfollowUser,
} from "./userThunk"

interface UserState {
	profile: User | null
	loading: boolean
	error: string | null
	isFollowing: boolean
}

const initialState: UserState = {
	profile: null,
	loading: false,
	error: null,
	isFollowing: false,
}

const userSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		clearProfile: (state) => {
			state.profile = null
			state.error = null
		},
	},
	extraReducers: (builder) => {
		builder

			// GET USER
			.addCase(getUser.pending, (state) => {
				state.loading = true
				state.error = null
			})

			.addCase(getUser.fulfilled, (state, action) => {
				state.loading = false
				state.profile = action.payload.user
				state.isFollowing = action.payload.is_following
			})

			.addCase(getUser.rejected, (state, action) => {
				state.loading = false
				state.error =
					(action.payload as string) ||
					"Failed to fetch user"
			})

			// FOLLOW
			.addCase(followUser.pending, (state) => {
				state.loading = true
				state.error = null
			})

			.addCase(followUser.fulfilled, (state) => {
				state.loading = false
				state.isFollowing = true
			})

			.addCase(followUser.rejected, (state, action) => {
				state.loading = false
				state.error =
					(action.payload as string) ||
					"Failed to follow user"
			})

			// UNFOLLOW
			.addCase(unfollowUser.pending, (state) => {
				state.loading = true
				state.error = null
			})

			.addCase(unfollowUser.fulfilled, (state) => {
				state.loading = false
				state.isFollowing = false
			})

			.addCase(unfollowUser.rejected, (state, action) => {
				state.loading = false
				state.error =
					(action.payload as string) ||
					"Failed to unfollow user"
			})
	},
})

export const { clearProfile } = userSlice.actions

export default userSlice.reducer
