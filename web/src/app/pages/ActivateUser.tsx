import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import api from "../api/axios"

export default function ActivateUserPage() {
	const { token } = useParams<{ token: string }>()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		async function activateUser() {
			if (!token) {
				setError("Invalid activation link")
				setLoading(false)
				return
			}

			try {
				await api.put(`users/activate/${token}`)

				setSuccess(true)
			} catch (error: any) {
				console.error(error)

				setError(
					error.response?.data?.message ||
					"Unable to activate your account.",
				)
			} finally {
				setLoading(false)
			}
		}

		activateUser()
	}, [token])

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md">
				<div className="bg-white p-10 rounded-3xl shadow-lg text-center">
					{loading && (
						<>
							<div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-700" />

							<h1 className="text-3xl font-extrabold text-gray-900">
								Activating account
							</h1>

							<p className="mt-3 text-gray-600">
								Please wait while we confirm
								your email.
							</p>
						</>
					)}

					{!loading && error && (
						<>
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
								!
							</div>

							<h1 className="mt-6 text-3xl font-extrabold text-gray-900">
								Activation failed
							</h1>

							<p className="mt-3 text-gray-600">
								{error}
							</p>

							<button
								onClick={() =>
									navigate("/register")
								}
								className="mt-8 w-full rounded-xl bg-gray-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
							>
								Back to Register
							</button>
						</>
					)}

					{!loading && !error && success && (
						<>
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
								✓
							</div>

							<h1 className="mt-6 text-3xl font-extrabold text-gray-900">
								Account activated!
							</h1>

							<p className="mt-3 text-gray-600">
								Your email has been verified
								successfully. You can now log
								in.
							</p>

							<button
								onClick={() =>
									navigate("/login")
								}
								className="mt-8 w-full rounded-xl bg-gray-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
							>
								Go to Login
							</button>
						</>
					)}
				</div>

				<div className="mt-8 text-center">
					<Link
						to="/"
						className="text-sm text-gray-500 hover:text-gray-800"
					>
						← Back to Gopher Social
					</Link>
				</div>
			</div>
		</div>
	)
}
