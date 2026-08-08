import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../app/features/auth/authSlice.ts"
import postReducer from "../app/features/post/postSlice.tsx"
import userReducer from "../app/features/user/userSlice"

export const store = configureStore({
	reducer: {
		auth: authReducer,
		posts: postReducer,
		users: userReducer,
	}
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
