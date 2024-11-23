import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // Base URL for your API
  withCredentials: true, // Ensure cookies are sent with requests
});

// Request interceptor to attach Authorization headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration (401 error)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Make a request to the silent-auth endpoint in the `auth` folder
        const response = await axiosInstance.get("/auth/silent-auth");

        const { newAccessToken } = response.data;

        if (newAccessToken) {
          // Update localStorage and retry the original request
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Silent auth failed:", refreshError);

        // Log the user out if token refresh fails
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;