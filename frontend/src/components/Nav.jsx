import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/customers", label: "Customers" },
  { to: "/stores", label: "Stores" },
  { to: "/products", label: "Products" },
  { to: "/transactions", label: "Transactions" },
];

export function Nav() {
  return (
    <header className="app-header">
      <div className="app-header__brand">Sales Website</div>
      <nav className="app-header__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => "nav-link" + (isActive ? " nav-link--active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
