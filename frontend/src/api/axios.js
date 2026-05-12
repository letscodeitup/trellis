import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (err) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;