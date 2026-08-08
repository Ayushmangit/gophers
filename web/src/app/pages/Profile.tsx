// src/app/pages/Profile.tsx

import { useEffect } from "react"
import { Link, useParams } from "react-router"
import { useAppDispatch, useAppSelector } from "../hooks"
import {
	getUser,
	followUser,
	unfollowUser,
} from "../../app/features/user/userThunk"

export default function Profile() {
	const { userID } = useParams()
	const dispatch = useAppDispatch()

	const {
		profile,
		loading,
		error,
		isFollowing,
	} = useAppSelector(
		(state) => state.users
	)

	const currentUser = useAppSelector(
		(state) => state.auth.userData
	)

	const id = Number(userID)

	useEffect(() => {
		if (!userID) return

		dispatch(getUser(id))
	}, [dispatch, userID, id])

	const handleFollow = async () => {
		if (!profile) return

		if (isFollowing) {
			await dispatch(unfollowUser(profile.id))
		} else {
			await dispatch(followUser(profile.id))
		}
	}

	if (loading && !profile) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<p className="text-gray-500">
					Loading profile...
				</p>
			</div>
		)
	}

	if (error && !profile) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="rounded-3xl bg-white p-10 text-center shadow-sm">
					<h1 className="text-2xl font-bold text-gray-900">
						Unable to load profile
					</h1>

					<p className="mt-3 text-red-500">
						{error}
					</p>

					<Link
						to="/home"
						className="mt-6 inline-block rounded-xl bg-gray-600 px-5 py-3 font-semibold text-white"
					>
						Back to Home
					</Link>
				</div>
			</div>
		)
	}

	if (!profile) {
		return null
	}

	const isOwnProfile =
		currentUser?.id === profile.id

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}

			<header className="border-b border-gray-200 bg-white">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
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
						Home
					</Link>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-4 py-10">
				{/* Profile */}

				<section className="rounded-3xl bg-white p-8 shadow-sm">
					<div className="flex flex-col items-center sm:flex-row sm:items-start">
						{/* Avatar */}

						<div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gray-200 text-4xl font-extrabold text-gray-600">
							{profile.username
								.charAt(0)
								.toUpperCase()}
						</div>

						{/* Information */}

						<div className="mt-6 flex-1 text-center sm:ml-7 sm:mt-0 sm:text-left">
							<div className="flex flex-col justify-between gap-4 sm:flex-row">
								<div>
									<h1 className="text-3xl font-extrabold text-gray-900">
										@
										{
											profile.username
										}
									</h1>

									<p className="mt-2 text-gray-500">
										Joined{" "}
										{new Date(
											profile.created_at
										).toLocaleDateString()}
									</p>
								</div>

								{/* Follow button */}

								{!isOwnProfile && (
									<button
										onClick={
											handleFollow
										}
										disabled={
											loading
										}
										className={`rounded-xl px-6 py-3 font-semibold transition ${isFollowing
												? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
												: "bg-gray-600 text-white hover:bg-blue-700"
											}`}
									>
										{isFollowing
											? "Following"
											: "Follow"}
									</button>
								)}
							</div>

							{/* Status */}

							<div className="mt-5">
								<span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
									{profile.is_active
										? "Active"
										: "Inactive"}
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Account information */}

				<section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
					<h2 className="text-xl font-bold text-gray-900">
						About
					</h2>

					<div className="mt-5 divide-y divide-gray-100">
						<div className="flex justify-between py-4">
							<span className="text-gray-500">
								Username
							</span>

							<span className="font-semibold text-gray-900">
								{
									profile.username
								}
							</span>
						</div>

						<div className="flex justify-between py-4">
							<span className="text-gray-500">
								User ID
							</span>

							<span className="font-semibold text-gray-900">
								{profile.id}
							</span>
						</div>

						<div className="flex justify-between py-4">
							<span className="text-gray-500">
								Role
							</span>

							<span className="font-semibold capitalize text-gray-900">
								{
									profile.role
										.name
								}
							</span>
						</div>
					</div>
				</section>

				{/* Actions */}

				{isOwnProfile && (
					<div className="mt-6">
						<Link
							to="/posts/create"
							className="block rounded-xl bg-gray-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
						>
							Create Post
						</Link>
					</div>
				)}
			</main>
		</div>
	)
}
