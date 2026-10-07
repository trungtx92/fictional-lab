const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

async function request(path, params = {}) {
  // Empty filters ("all categories", no postcode) are left out of the query string.
  const qs = new URLSearchParams(Object.entries(params).filter(([, value]) => value)).toString();
  const res = await fetch(`${BASE_URL}${path}${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

// The backend has no auth endpoints yet, so sign-in still resolves locally
// after a short delay.
function resolveLater(produce, ms = 300) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(produce());
      } catch (err) {
        reject(err);
      }
    }, ms);
  });
}

export const api = {
  getOverview: (filters) => request("/api/overview", filters),
  getStateDetails: (code, filters) => request(`/api/states/${encodeURIComponent(code)}`, filters),

  // Mock sign-in: accepts any well-formed email with a non-empty password.
  signIn: ({ email, password }) =>
    resolveLater(() => {
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
      if (!password) throw new Error("Enter your password.");
      return { email };
    }),

  // Placeholder for the Google OAuth flow.
  signInWithGoogle: () => resolveLater(() => ({ email: "demo.user@gmail.com" })),
};
