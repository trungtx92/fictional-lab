import { Router } from "express";
import { customers, transactions } from "../data/mockData.js";

const router = Router();

router.get("/", (req, res) => {
  const { search } = req.query;
  let result = customers;
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (c) =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }
  res.json(result);
});

router.get("/:id", (req, res) => {
  const customer = customers.find((c) => c.customer_id === Number(req.params.id));
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});

router.get("/:id/transactions", (req, res) => {
  const customerId = Number(req.params.id);
  const customer = customers.find((c) => c.customer_id === customerId);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  const result = transactions.filter((t) => t.customer_id === customerId);
  res.json(result);
});

export default router;
