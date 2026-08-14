import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../app/features/auth/authSlice.ts"
import postReducer from "../app/features/post/postSlice.tsx"
import userReducer from "../app/features/user/userSlice"
import exploreReducer from "../app/features/explore/exploreSlice.ts"

export const store = configureStore({
	reducer: {
		auth: authReducer,
		posts: postReducer,
		users: userReducer,
		explore: exploreReducer,
	}
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
