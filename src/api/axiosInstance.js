import axios from "axios";

const instance = axios.create({
  baseURL: "https://routine-management-server.onrender.com // https://routine-management-server.onrender.com
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
