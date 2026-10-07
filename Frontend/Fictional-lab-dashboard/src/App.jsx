import { Routes, Route, Link } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth.jsx";
import { Login } from "./pages/Login.jsx";
import { Overview } from "./pages/Overview.jsx";
import { StateDetails } from "./pages/StateDetails.jsx";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Overview />} />
        <Route path="/states/:code" element={<StateDetails />} />
      </Route>
      <Route
        path="*"
        element={
          <p className="page-message">
            Page not found. <Link to="/">Back to sales overview</Link>
          </p>
        }
      />
    </Routes>
  );
}
