import PostForm from "./PostForm"

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/v1"

function App() {

  return (
    <>
      <h1 className="text-3xl  text-center "  >GOPHER SOCIAL </h1>
      <PostForm />
    </>
  )
}

export default App
