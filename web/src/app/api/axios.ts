import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_BASE_URL
})

api.interceptors.request.use((cfg) => {
	const token = localStorage.getItem("access_token")
	if (token) {
		cfg.headers.Authorization = `Bearer ${token}`
	}
	return cfg
})

export default api


