// src/axiosInstance.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://routine-management-server.onrender.com", // backend port
});

export default instance;
