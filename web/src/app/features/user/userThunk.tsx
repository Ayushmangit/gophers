import { createAsyncThunk } from "@reduxjs/toolkit"
import type { User } from "../../types/User"
import api from "../../api/axios"

export const getUser = createAsyncThunk<
	User,
	number,
	{ rejectValue: string }
>(
	"users/getUser",
	async (userID, thunkAPI) => {
		try {
			const response = await api.get(
				`/users/${userID}`
			)

			return response.data
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
