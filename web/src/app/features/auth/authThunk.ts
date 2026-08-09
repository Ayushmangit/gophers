import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"
import type {
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
	string,
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

			return response.data.data
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
