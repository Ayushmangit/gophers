import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../hooks"
import { createPost } from "../features/post/postThunk.tsx"
import type { CreatePost } from "../types/Posts.ts"

interface CreatePostForm {
	title: string
	content: string
	tags: string
}

export default function CreatePost() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const { loading, error } = useAppSelector(
		(state) => state.posts
	)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreatePostForm>()

	const onSubmit = async (data: CreatePostForm) => {
		const result = await dispatch(
			createPost({
				title: data.title,
				content: data.content,
				tags: data.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter(Boolean),
			})
		)

		if (createPost.fulfilled.match(result)) {
			navigate("/home")
		}
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="border-b border-gray-200 bg-white">
				<div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
					<button
						onClick={() => navigate("/home")}
						className="text-2xl font-extrabold text-gray-900"
					>
						Gopher Social
					</button>

					<button
						onClick={() => navigate(-1)}
						className="text-sm font-semibold text-gray-500 hover:text-gray-900"
					>
						Cancel
					</button>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-4 py-10">
				<div className="mb-8">
					<h1 className="text-4xl font-extrabold text-gray-900">
						Create a Post
					</h1>

					<p className="mt-2 text-gray-600">
						Share something with the Gopher Social
						community.
					</p>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="rounded-3xl bg-white p-8 shadow-sm"
				>
					{/* Server error */}

					{error && (
						<div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
							{error}
						</div>
					)}

					{/* Title */}

					<div className="mb-6">
						<label className="mb-2 block text-sm font-semibold text-gray-700">
							Title
						</label>

						<input
							{...register("title", {
								required:
									"Title is required",
								maxLength: {
									value: 200,
									message:
										"Title is too long",
								},
							})}
							placeholder="Give your post a title..."
							className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
						/>

						{errors.title && (
							<p className="mt-2 text-sm text-red-500">
								{
									errors.title
										.message
								}
							</p>
						)}
					</div>

					{/* Content */}

					<div className="mb-6">
						<label className="mb-2 block text-sm font-semibold text-gray-700">
							Content
						</label>

						<textarea
							{...register("content", {
								required:
									"Content is required",
							})}
							rows={8}
							placeholder="What's on your mind?"
							className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
						/>

						{errors.content && (
							<p className="mt-2 text-sm text-red-500">
								{
									errors.content
										.message
								}
							</p>
						)}
					</div>

					{/* Tags */}

					<div className="mb-8">
						<label className="mb-2 block text-sm font-semibold text-gray-700">
							Tags
						</label>

						<input
							{...register("tags")}
							placeholder="golang, backend, programming"
							className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
						/>

						<p className="mt-2 text-sm text-gray-400">
							Separate tags with commas.
						</p>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl bg-gray-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading
							? "Publishing..."
							: "Publish Post"}
					</button>
				</form>
			</main>
		</div>
	)
}
