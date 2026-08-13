import { createAsyncThunk } from "@reduxjs/toolkit"
import type { User } from "../../types/User"
import api from "../../api/axios"

interface UserProfile {
	user: User
	is_following: boolean
}

export const getUser = createAsyncThunk<
	UserProfile,
	number,
	{ rejectValue: string }
>(
	"users/getUser",
	async (userID, thunkAPI) => {
		try {
			const response = await api.get(
				`/users/${userID}`
			)

			const { user, is_following } = response.data.data
			return { user, is_following }
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data?.message ??
				"Failed to fetch user"
			)
		}
	}
)

export const followUser = createAsyncThunk<
	void,
	number,
	{ rejectValue: string }
>(
	"users/followUser",
	async (userID, thunkAPI) => {
		try {
			await api.put(
				`/users/${userID}/follow`
			)
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data?.message ??
				"Failed to follow user"
			)
		}
	}
)

export const unfollowUser = createAsyncThunk<
	void,
	number,
	{ rejectValue: string }
>(
	"users/unfollowUser",
	async (userID, thunkAPI) => {
		try {
			await api.put(
				`/users/${userID}/unfollow`
			)
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data?.message ??
				"Failed to unfollow user"
			)
		}
	}
)

export const searchUsers = createAsyncThunk(
	"users/searchUsers",
	async (username: string, thunkAPI) => {
		try {
			const response = await api.get("/users/search", {
				params: {
					username,
				},
			})

			return response.data.data
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.response?.data?.message ||
				"Failed to search users"
			)
		}
	}
)
