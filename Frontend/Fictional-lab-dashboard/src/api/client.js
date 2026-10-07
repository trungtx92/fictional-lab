import * as mock from "../data/mockSales.js";

// The backend has no auth or aggregate endpoints yet, so every call resolves
// from the in-memory mock after a short delay. This file is the only place
// that needs to change when real endpoints exist: swap each body for a fetch().
function resolveLater(produce, ms = 150) {
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
  getOverview: (filters) => resolveLater(() => mock.getOverview(filters)),
  getStateDetails: (code, filters) => resolveLater(() => mock.getStateDetails(code, filters)),

  // Mock sign-in: accepts any well-formed email with a non-empty password.
  signIn: ({ email, password }) =>
    resolveLater(() => {
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
      if (!password) throw new Error("Enter your password.");
      return { email };
    }, 300),

  // Placeholder for the Google OAuth flow.
  signInWithGoogle: () => resolveLater(() => ({ email: "demo.user@gmail.com" }), 300),
};
