import { useNavigate, useParams } from "react-router-dom"
import { API_URL } from "./App"

export const ConfirmationPage = () => {

  const { token = '' } = useParams()
  const redirect = useNavigate()

  async function handleConfirm() {
    const res = await fetch(`${API_URL}/users/activate/${token}`, {
      method: "PUT"
    })

    if (res.ok) {
      //NOTE:redirect to the "/" page
      redirect("/")
    } else {
      //NOTE:handler err
      alert("failed to confirm token")
    }
  }
  return (
    <>
      <h1>Verificaton</h1>
      <button className="bg-red-500 p-2 rounded-4xl" onClick={() => handleConfirm()}>Verify</button>
    </>)
}
