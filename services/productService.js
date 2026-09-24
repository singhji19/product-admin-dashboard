import api from "@/lib/api";

// WHY: all API calls live here, not in UI files (rule).
const DELAY = 0; // set to 2000 to test "old results must not replace new ones"

export const login = (username, password) =>
  api.post("/auth/login", { username, password, expiresInMins: 60 }).then((r) => r.data);

// KEY DECISION: the API cannot search AND filter by category together, so ONE endpoint is picked:
// search text wins over category (README #1).
export const fetchProducts = ({ q, category, limit, skip, sortBy, order }, signal) => {
  const url = q ? "/products/search" : category ? `/products/category/${encodeURIComponent(category)}` : "/products";
  const params = { limit, skip, delay: DELAY || undefined, ...(q && { q }), ...(sortBy && { sortBy, order }) };
  return api.get(url, { params, signal }).then((r) => r.data); // signal lets us cancel old requests
};

export const fetchCategories = () => api.get("/products/categories").then((r) => r.data);
export const fetchProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);

// WHY: the server "fakes" saving, but we still call it so the real request flow (loading/error) works.
// Locally-created ids are huge (Date.now) and don't exist on the server, so we skip the call for them.
export const addProduct = (d) => api.post("/products/add", d).then((r) => r.data);
export const updateProduct = (id, d) => (id < 1000 ? api.put(`/products/${id}`, d) : Promise.resolve());
export const deleteProduct = (id) => (id < 1000 ? api.delete(`/products/${id}`) : Promise.resolve());
