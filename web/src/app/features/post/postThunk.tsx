import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"
import type {
	Comment,
	CreateComment,
	CreatePost,
	FeedQuery,
	Post,
	UpdatePost,
} from "../../types/Posts.ts"

export const getFeed = createAsyncThunk<
	Post[],
	FeedQuery | undefined,
	{ rejectValue: string }
>(
	"posts/getFeed",
	async (query, thunkAPI) => {
		try {
			const response = await api.get(
				"/users/feed",
				{
					params: {
						since: query?.since,
						until: query?.until,
						limit: query?.limit ?? 40,
						offset: query?.offset ?? 0,
						sort: query?.sort ?? "desc",
						tags: query?.tags,
						search: query?.search,
					},
				},
			)

			console.log(
				"Feed response:",
				response.data,
			)

			return response.data.data ?? []
		} catch (error: any) {
			console.error(
				"Feed request failed:",
				error,
			)

			const message =
				error.response?.data?.message ||
				error.response?.data ||
				"Failed to load feed"

			return thunkAPI.rejectWithValue(
				String(message),
			)
		}
	},
)

export const getPost = createAsyncThunk<
	Post,
	number,
	{ rejectValue: string }
>(
	"posts/getPost",
	async (postID, thunkAPI) => {
		try {
			const response = await api.get(
				`/posts/${postID}`,
			)

			return response.data.data ?? []
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.response?.data ||
				"Failed to fetch post"

			return thunkAPI.rejectWithValue(
				String(message),
			)
		}
	},
)

export const createPost = createAsyncThunk<
	Post,
	CreatePost,
	{ rejectValue: string }
>(
	"posts/createPost",
	async (data, thunkAPI) => {
		try {
			const response = await api.post(
				"/posts/",
				data,
			)

			return response.data.data
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.response?.data ||
				"Failed to create post"

			return thunkAPI.rejectWithValue(
				String(message),
			)
		}
	},
)

export const deletePost = createAsyncThunk<
	number,
	number,
	{ rejectValue: string }
>(
	"posts/deletePost",
	async (postID, thunkAPI) => {
		try {
			await api.delete(`/posts/${postID}`)

			return postID
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.response?.data ||
				"Failed to delete post"

			return thunkAPI.rejectWithValue(
				String(message),
			)
		}
	},
)

export const updatePost = createAsyncThunk<
	Post,
	UpdatePost,
	{ rejectValue: string }
>(
	"posts/updatePost",
	async (data, thunkAPI) => {
		try {
			const response = await api.patch(
				`/posts/${data.id}`,
				{
					title: data.title,
					content: data.content,
					version: data.version,
				},
			)

			return response.data.data
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.response?.data ||
				"Failed to update post"

			return thunkAPI.rejectWithValue(
				String(message),
			)
		}
	},
)

export const createComment = createAsyncThunk<
	Comment,
	CreateComment,
	{ rejectValue: string }
>(
	"posts/createComment",
	async (data, thunkAPI) => {
		try {
			const response = await api.post(
				`/posts/${data.postID}/comment`,
				{
					content: data.content,
				},
			)

			return response.data.data ?? []
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.response?.data ||
				"Failed to create comment"

			return thunkAPI.rejectWithValue(
				String(message),
			)
		}
	},
)
