import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export function Login() {
  const { user, signIn, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (user) return <Navigate to={location.state?.from ?? "/"} replace />;

  const run = async (action) => {
    setSubmitting(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message || "Sign in failed");
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run(() => signIn({ email: email.trim(), password, remember }));
  };

  return (
    <div className="login">
      <div className="login__preview">
        <h1 className="login__tagline">
          Sales across Australia,
          <br />
          state by state
        </h1>
      </div>

      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <h2>Sign in</h2>
        <input
          className="input"
          type="email"
          placeholder="email"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="password"
          aria-label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="checkbox">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
        <span className="login__or">— or —</span>
        <button
          type="button"
          className="button button--outline"
          disabled={submitting}
          onClick={() => run(() => signInWithGoogle({ remember }))}
        >
          <span className="login__g" aria-hidden="true">
            G
          </span>
          Continue with Gmail
        </button>
      </form>
    </div>
  );
}
