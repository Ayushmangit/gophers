import { BrowserRouter, Route, Routes } from "react-router"

import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes"
import Home from "./components/Home/Home"

import PublicPage from "./app/pages/PublicPage"
import RegisterUser from "./app/pages/Register"
import ActivateUserPage from "./app/pages/ActivateUser"
import Login from "./app/pages/Login"

import CreatePost from "./app/pages/CreatePost"
import PostDetails from "./app/pages/PostDetails"
import Profile from "./app/pages/Profile"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}

        <Route
          path="/"
          element={<PublicPage />}
        />

        <Route
          path="/register"
          element={<RegisterUser />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/users/activate/:token"
          element={<ActivateUserPage />}
        />

        {/* Protected */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts/create"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts/:postID"
          element={
            <ProtectedRoute>
              <PostDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userID"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
