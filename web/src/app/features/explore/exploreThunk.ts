import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"
import type { Post } from "../../types/Posts"

interface GetExplorePostsPayload {
	limit: number
	offset: number
}
export const getAllPosts = createAsyncThunk<
	Post[],
	GetExplorePostsPayload,
	{ rejectValue: string }
>(
	"explore/getAllPosts",
	async ({ limit, offset }, { rejectWithValue }) => {
		try {
			const response = await api.get(
				"/users/explore",
				{
					params: {
						limit,
						offset,
					}
				}
			)

			return response.data.data ?? []
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.error ||
				"Failed to load explore posts"
			)
		}
	}
)
