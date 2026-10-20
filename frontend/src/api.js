const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path, options) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") msg = data.detail;
    } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

export const listProducts = () => request("/products");
export const getProduct = (id) => request(`/products/${id}`);
export const createProduct = (p) =>
  request("/products", { method: "POST", body: JSON.stringify(p) });
export const updateProduct = (id, p) =>
  request(`/products/${id}`, { method: "PUT", body: JSON.stringify(p) });
export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: "DELETE" });
