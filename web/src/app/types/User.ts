export const RoleId = {
	USER: 0,
	MODERATOR: 1,
	ADMIN: 2,
} as const

export type RoleId = (typeof RoleId)[keyof typeof RoleId]

export interface Role {
	id: RoleId
	name: string
	description: string
	level: number
}

export interface RegisterUser {
	username: string
	email: string
	password: string
}

export interface User {
	id: number
	username: string
	email: string
	created_at: string
	is_active: boolean
	role_id: RoleId
	role: Role
}

export interface RegisterResponse {
	user: User
	token: string
}

export interface LoginUser {
	email: string
	password: string
}


export type LoginResponse = string
