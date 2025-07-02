// src/axiosInstance.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // backend port
});

export default instance;
