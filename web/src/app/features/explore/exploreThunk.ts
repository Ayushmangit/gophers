import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"
import type { Post } from "../../types/Posts"


export const getAllPosts = createAsyncThunk<
	Post[],
	void,
	{ rejectValue: string }
>(
	"explore/getAllPosts",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/users/explore")

			return response.data.data ?? []
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.error ||
				"Failed to load explore posts"
			)
		}
	}
)
