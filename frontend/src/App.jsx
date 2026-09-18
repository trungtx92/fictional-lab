import { Routes, Route } from "react-router-dom";
import { Nav } from "./components/Nav.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Customers } from "./pages/Customers.jsx";
import { CustomerDetail } from "./pages/CustomerDetail.jsx";
import { Stores } from "./pages/Stores.jsx";
import { StoreDetail } from "./pages/StoreDetail.jsx";
import { Products } from "./pages/Products.jsx";
import { Transactions } from "./pages/Transactions.jsx";
import { TransactionDetail } from "./pages/TransactionDetail.jsx";

export function App() {
  return (
    <>
      <Nav />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/stores/:id" element={<StoreDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
