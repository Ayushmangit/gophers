//TODO: ADD me thunk,add reducer,create the backend endponint prolly just return the user from the authmiddleware easy peasy
import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"
import type {
	LoginResponse,
	LoginUser,
	RegisterUser,
} from "../../types/User"

export const registerUser = createAsyncThunk<
	any,
	RegisterUser,
	{ rejectValue: string }
>(
	"authentication/user",
	async (data, thunkAPI) => {
		try {
			const response = await api.post(
				"authentication/user",
				data,
			)

			return response.data
		} catch (error: any) {
			console.error("Register error:", error)

			const message =
				error.response?.data?.message ||
				"Something went wrong. Please try again."

			return thunkAPI.rejectWithValue(message)
		}
	},
)

export const loginUser = createAsyncThunk<
	LoginResponse,
	LoginUser,
	{ rejectValue: string }
>(
	"authentication/token",
	async (data, thunkAPI) => {
		try {
			const response = await api.post(
				"authentication/token",
				data,
			)
			const { user, access_token } = response.data.data
			return { user, access_token }
		} catch (error: any) {
			console.error("Login error:", error)

			const message =
				error.response?.data?.message ||
				"Something went wrong. Please try again."

			return thunkAPI.rejectWithValue(message)
		}
	},
)


export const logoutUser = createAsyncThunk(
	"auth/logout",
	async (_, { rejectWithValue }) => {
		try {
			localStorage.removeItem("access_token")

			return null
		} catch (error) {
			return rejectWithValue("Logout failed")
		}
	}
)

export const me = createAsyncThunk("authentication/me", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("authentication/me")
		console.log("me hit")
		console.log("me response", response)
		console.log("me response data", response.data)
		console.log("me response data data", response.data.data)
		const { user } = response.data.data
		return user
	} catch (error) {
		return rejectWithValue("unauthorized")
	}
})
