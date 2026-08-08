import { Link } from "react-router"

export default function RegisterSuccess() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-lg">
				<div className="bg-white p-10 rounded-3xl shadow-lg text-center">
					{/* Success Icon */}
					<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
						<svg
							className="h-10 w-10 text-green-600"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					<h1 className="mt-7 text-4xl font-extrabold text-gray-900">
						Registration successful!
					</h1>

					<p className="mt-4 text-lg text-gray-600">
						Your Gopher Social account has been
						created successfully.
					</p>

					{/* Activation Reminder */}
					<div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-left">
						<h2 className="text-lg font-bold text-gray-900">
							Check your email
						</h2>

						<p className="mt-2 leading-relaxed text-gray-700">
							We've sent an activation link to your
							email address. Click the link in the
							email to activate your account.
						</p>

						<p className="mt-3 text-sm text-gray-600">
							You won't be able to log in until your
							account has been activated.
						</p>
					</div>

					{/* Reminder */}
					<div className="mt-6 rounded-2xl bg-gray-50 p-5">
						<p className="text-sm leading-relaxed text-gray-600">
							<strong className="text-gray-800">
								Didn't receive the email?
							</strong>{" "}
							Check your spam or junk folder. Make
							sure you entered the correct email
							address during registration.
						</p>
					</div>

					<div className="mt-8">
						<Link
							to="/login"
							className="inline-flex w-full items-center justify-center rounded-xl bg-gray-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
						>
							Go to Login
						</Link>
					</div>

					<div className="mt-5">
						<Link
							to="/"
							className="text-sm text-gray-500 transition hover:text-gray-800"
						>
							← Back to Gopher Social
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
