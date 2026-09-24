import axios from "axios";

// WHY: ONE shared instance = one baseURL/timeout for the whole app (rule: "one shared Axios setup").
const api = axios.create({ baseURL: "https://dummyjson.com", timeout: 10000 });

// WHY: request interceptor adds the login token to EVERY call, so no component touches the token.
api.interceptors.request.use((cfg) => {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// WHY: response interceptor = errors handled in ONE place (rule).
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err); // cancelled on purpose, not a real error
    if (err.response?.status === 401 && !location.pathname.startsWith("/login")) {
      localStorage.removeItem("token"); // expired token -> force re-login
      location.href = "/login";
    }
    // WHY: UI only needs one readable string, never raw axios errors.
    err.userMessage =
      err.response?.data?.message || (err.request ? "Network error. Check your connection and retry." : "Something went wrong.");
    return Promise.reject(err);
  }
);
export default api;
