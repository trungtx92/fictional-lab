const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getCustomers: (search) => request(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getCustomer: (id) => request(`/api/customers/${id}`),
  getCustomerTransactions: (id) => request(`/api/customers/${id}/transactions`),

  getStores: () => request("/api/stores"),
  getStore: (id) => request(`/api/stores/${id}`),
  getStoreSalesSummary: (id) => request(`/api/stores/${id}/sales-summary`),

  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (id) => request(`/api/products/${id}`),

  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/transactions${qs ? `?${qs}` : ""}`);
  },
  getTransaction: (id) => request(`/api/transactions/${id}`),
  createTransaction: (payload) =>
    request("/api/transactions", { method: "POST", body: JSON.stringify(payload) }),
};
