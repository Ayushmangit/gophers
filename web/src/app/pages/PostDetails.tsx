import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { useAppDispatch, useAppSelector } from "../hooks"
import {
	createComment,
	deletePost,
	getPost,
} from "../features/post/postThunk.tsx"

interface CommentForm {
	content: string
}

export default function PostDetails() {
	const { postID } = useParams()
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const {
		currentPost: post,
		loading,
		error,
	} = useAppSelector((state) => state.posts)

	const {
		register,
		handleSubmit,
		reset,
	} = useForm<CommentForm>()

	useEffect(() => {
		if (!postID) return

		dispatch(getPost(Number(postID)))
	}, [dispatch, postID])

	const handleComment = async (
		data: CommentForm
	) => {
		if (!postID) return

		const result = await dispatch(
			createComment({
				postID: Number(postID),
				content: data.content,
			})
		)

		if (createComment.fulfilled.match(result)) {
			reset()
		}
	}

	const handleDelete = async () => {
		if (!post) return

		const result = await dispatch(
			deletePost(post.id)
		)

		if (deletePost.fulfilled.match(result)) {
			navigate("/home")
		}
	}

	if (loading && !post) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<p className="text-gray-500">
					Loading post...
				</p>
			</div>
		)
	}

	if (error && !post) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="rounded-2xl bg-white p-8 text-center shadow-sm">
					<h1 className="text-xl font-bold text-gray-900">
						Unable to load post
					</h1>

					<p className="mt-2 text-red-500">
						{error}
					</p>

					<Link
						to="/home"
						className="mt-5 inline-block rounded-xl bg-gray-600 px-5 py-2.5 text-white"
					>
						Back to Home
					</Link>
				</div>
			</div>
		)
	}

	if (!post) {
		return null
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="border-b border-gray-200 bg-white">
				<div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
					<Link
						to="/home"
						className="text-2xl font-extrabold text-gray-900"
					>
						Gopher Social
					</Link>

					<Link
						to="/home"
						className="text-sm font-semibold text-gray-500 hover:text-gray-900"
					>
						Back to Feed
					</Link>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-4 py-10">
				<article className="rounded-3xl bg-white p-8 shadow-sm">
					{/* Author */}

					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700">
							{post.user.username
								.charAt(0)
								.toUpperCase()}
						</div>

						<div>
							<p className="font-semibold text-gray-900">
								@
								{
									post.user
										.username
								}
							</p>

							<p className="text-sm text-gray-500">
								{new Date(
									post.created_at
								).toLocaleDateString()}
							</p>
						</div>
					</div>

					{/* Post */}

					<div className="mt-8">
						<h1 className="text-4xl font-extrabold text-gray-900">
							{post.title}
						</h1>

						<p className="mt-5 whitespace-pre-wrap text-lg leading-relaxed text-gray-600">
							{post.content}
						</p>
					</div>

					{/* Tags */}

					{post.tags.length > 0 && (
						<div className="mt-6 flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
								>
									#{tag}
								</span>
							))}
						</div>
					)}

					{/* Delete */}

					<div className="mt-8 border-t border-gray-100 pt-5">
						<button
							onClick={handleDelete}
							disabled={loading}
							className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
						>
							Delete Post
						</button>
					</div>
				</article>

				{/* Comments */}

				<section className="mt-8">
					<h2 className="text-2xl font-bold text-gray-900">
						Comments{" "}
						<span className="text-gray-400">
							({post.comment_count})
						</span>
					</h2>

					<form
						onSubmit={handleSubmit(
							handleComment
						)}
						className="mt-5 rounded-2xl bg-white p-5 shadow-sm"
					>
						<textarea
							{...register("content", {
								required: true,
							})}
							rows={4}
							placeholder="Write a comment..."
							className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
						/>

						<button
							type="submit"
							className="mt-3 rounded-xl bg-gray-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
						>
							Comment
						</button>
					</form>

					<div className="mt-5 space-y-4">
						{post.comments.map(
							(comment) => (
								<div
									key={
										comment.id
									}
									className="rounded-2xl bg-white p-5 shadow-sm"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-bold">
											{comment.user.username
												.charAt(
													0
												)
												.toUpperCase()}
										</div>

										<div>
											<p className="font-semibold text-gray-900">
												@
												{
													comment
														.user
														.username
												}
											</p>

											<p className="text-xs text-gray-400">
												{new Date(
													comment.created_at
												).toLocaleDateString()}
											</p>
										</div>
									</div>

									<p className="mt-3 text-gray-600">
										{
											comment.content
										}
									</p>
								</div>
							)
						)}
					</div>
				</section>
			</main>
		</div>
	)
}
