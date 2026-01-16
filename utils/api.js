import axios from "axios";
import { BASE_URL } from "@env";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Anda bisa menambahkan interceptor di sini jika diperlukan (misal untuk menambahkan token)
// api.interceptors.request.use(async (config) => { ... });

export default api;
