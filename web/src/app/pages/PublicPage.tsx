import { Link, Navigate } from "react-router"
import { useAppSelector } from "../hooks"

export default function PublicPage() {
	const token = useAppSelector(
		(state) => state.auth.accessToken,
	)

	if (token) {
		return <Navigate to="/home" replace />
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 flex-col">
			<div className="max-w-xl w-full text-center bg-white p-10 rounded-3xl shadow-lg">
				<h1 className="text-6xl font-extrabold text-gray-900 mb-4">
					Gopher Social
				</h1>

				<p className="text-gray-700 mb-8 text-lg">
					Share ideas. Write stories.{" "}
					<strong>Connect with developers.</strong>
				</p>

				<div className="flex flex-col sm:flex-row justify-center gap-4">
					<Link
						to="/login"
						className="flex-1 inline-flex justify-center items-center px-6 py-3 rounded-xl
						bg-gray-600 text-white font-semibold hover:bg-blue-700 transition"
					>
						Login
					</Link>

					<Link
						to="/register"
						className="flex-1 inline-flex justify-center items-center px-6 py-3 rounded-xl text-gray-800
						border border-gray-300 bg-gray-50 font-semibold hover:bg-gray-100 transition"
					>
						Join Gopher Social
					</Link>
				</div>
			</div>

			<div className="mt-12 bg-gray-50 py-16 px-6 text-center rounded-3xl mx-auto max-w-3xl shadow-sm">
				<p className="text-gray-800 text-lg md:text-xl leading-relaxed">
					A place to share what you're building,
					<br />
					<strong>
						what you're learning, and what you think.
					</strong>
				</p>

				<p className="mt-5 text-gray-600 text-base md:text-lg leading-relaxed">
					Write posts, follow interesting people, discover
					new ideas, and join conversations with a community
					that loves to build.
				</p>
			</div>
		</div>
	)
}
