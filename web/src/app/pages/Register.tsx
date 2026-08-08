import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { useAppDispatch, useAppSelector } from "../hooks"
import { registerUser } from "../features/auth/authThunk"
import type { RegisterUser as RegisterUserType } from "../types/User"

export default function RegisterUser() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const { loading, error } = useAppSelector(
		(state) => state.auth,
	)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterUserType>()

	async function onSubmit(data: RegisterUserType) {
		try {
			await dispatch(registerUser(data)).unwrap()

			navigate("/register-success")
		} catch {
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
			<div className="w-full max-w-md">
				<div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-extrabold text-gray-900">
							Create your account
						</h1>

						<p className="mt-3 text-gray-600">
							Join Gopher Social and start sharing.
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-5"
					>
						<div>
							<label
								htmlFor="username"
								className="block mb-2 text-sm font-semibold text-gray-700"
							>
								Username
							</label>

							<input
								id="username"
								type="text"
								placeholder="Enter your username"
								{...register("username", {
									required: "Username is required",
									minLength: {
										value: 3,
										message:
											"Username must be at least 3 characters",
									},
								})}
								className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>

							{errors.username && (
								<p className="mt-1 text-sm text-red-500">
									{errors.username.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="email"
								className="block mb-2 text-sm font-semibold text-gray-700"
							>
								Email
							</label>

							<input
								id="email"
								type="email"
								placeholder="you@example.com"
								{...register("email", {
									required: "Email is required",
									pattern: {
										value:
											/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message:
											"Enter a valid email address",
									},
								})}
								className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>

							{errors.email && (
								<p className="mt-1 text-sm text-red-500">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="password"
								className="block mb-2 text-sm font-semibold text-gray-700"
							>
								Password
							</label>

							<input
								id="password"
								type="password"
								placeholder="Enter your password"
								{...register("password", {
									required: "Password is required",
									minLength: {
										value: 8,
										message:
											"Password must be at least 8 characters",
									},
								})}
								className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>

							{errors.password && (
								<p className="mt-1 text-sm text-red-500">
									{errors.password.message}
								</p>
							)}
						</div>

						{error && (
							<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-xl bg-gray-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading
								? "Creating account..."
								: "Create account"}
						</button>
					</form>

					<div className="mt-8 text-center text-sm text-gray-600">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-semibold text-blue-600 hover:text-blue-700"
						>
							Login
						</Link>
					</div>
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
