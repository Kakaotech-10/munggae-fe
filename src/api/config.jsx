import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 이 부분을 변경합니다.
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
