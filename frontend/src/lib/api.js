const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const { token, headers, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    ...fetchOptions
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function getCategories() {
  return request("/api/categories");
}

export function getProducts(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return request(`/api/products${query ? `?${query}` : ""}`);
}

export function register(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMe(token) {
  return request("/api/auth/me", {
    token
  });
}

export function createOrder(payload, token) {
  return request("/api/orders", {
    token,
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getOrders(token) {
  return request("/api/orders", {
    token
  });
}

export function cancelOrder(orderId, token) {
  return request(`/api/orders/${orderId}/cancel`, {
    token,
    method: "PATCH"
  });
}
