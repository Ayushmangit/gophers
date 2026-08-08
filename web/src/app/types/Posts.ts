export interface Role {
	id: number
	name: string
	description: string
	level: number
}

export interface PostUser {
	id: number
	username: string
	email: string
	created_at: string
	is_active: boolean
	role_id: number
	role: Role
}

export interface Comment {
	id: number
	post_id: number
	user_id: number
	content: string
	created_at: string
	user: PostUser
}

export interface Post {
	id: number
	content: string
	title: string
	user_id: number
	tags: string[]
	created_at: string
	updated_at: string
	version: number
	comments: Comment[]
	comment_count: number
	user: PostUser
}

export interface CreatePost {
	title: string
	content: string
	tags: string[]
}

export interface UpdatePost {
	id: number
	title: string
	content: string
	version: number
}

export interface CreateComment {
	postID: number
	content: string
}

export interface FeedQuery {
	since?: string
	until?: string
	limit?: number
	offset?: number
	sort?: "asc" | "desc"
	tags?: string
	search?: string
}

