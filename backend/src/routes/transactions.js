import { Router } from "express";
import {
  transactions,
  transactionItems,
  customers,
  stores,
  products,
} from "../data/mockData.js";

const router = Router();

function withItems(transaction) {
  const items = transactionItems
    .filter((i) => i.transaction_id === transaction.transaction_id)
    .map((i) => ({
      ...i,
      product: products.find((p) => p.product_id === i.product_id) ?? null,
    }));
  return { ...transaction, items };
}

router.get("/", (req, res) => {
  const { customer_id, store_id, status } = req.query;
  let result = transactions;
  if (customer_id) result = result.filter((t) => t.customer_id === Number(customer_id));
  if (store_id) result = result.filter((t) => t.store_id === Number(store_id));
  if (status) result = result.filter((t) => t.status === status);

  // list view returns the transaction plus lightweight customer/store labels,
  // without the full nested item list (kept for the detail endpoint)
  const enriched = result.map((t) => ({
    ...t,
    customer_name: (() => {
      const c = customers.find((c) => c.customer_id === t.customer_id);
      return c ? `${c.first_name} ${c.last_name}` : null;
    })(),
    store_name: stores.find((s) => s.store_id === t.store_id)?.store_name ?? null,
  }));
  res.json(enriched);
});

router.get("/:id", (req, res) => {
  const transaction = transactions.find((t) => t.transaction_id === Number(req.params.id));
  if (!transaction) return res.status(404).json({ error: "Transaction not found" });
  const customer = customers.find((c) => c.customer_id === transaction.customer_id) ?? null;
  const store = stores.find((s) => s.store_id === transaction.store_id) ?? null;
  res.json({ ...withItems(transaction), customer, store });
});

// Creates a transaction with its line items in one call — mirrors the
// atomic "insert transaction + transaction_items" behavior described
// for POST /api/transactions in the Technical Requirements Document.
router.post("/", (req, res) => {
  const { customer_id, store_id, payment_method, items } = req.body ?? {};

  if (!customer_id || !store_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "customer_id, store_id, and a non-empty items array are required",
    });
  }
  if (!customers.some((c) => c.customer_id === Number(customer_id))) {
    return res.status(400).json({ error: `Unknown customer_id ${customer_id}` });
  }
  if (!stores.some((s) => s.store_id === Number(store_id))) {
    return res.status(400).json({ error: `Unknown store_id ${store_id}` });
  }

  const nextTransactionId = Math.max(0, ...transactions.map((t) => t.transaction_id)) + 1;
  let nextItemId = Math.max(0, ...transactionItems.map((i) => i.transaction_item_id)) + 1;

  let totalAmount = 0;
  const newItems = [];
  for (const { product_id, quantity } of items) {
    const product = products.find((p) => p.product_id === Number(product_id));
    if (!product) {
      return res.status(400).json({ error: `Unknown product_id ${product_id}` });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: `Invalid quantity for product_id ${product_id}` });
    }
    const line_total = Math.round(product.unit_price * quantity * 100) / 100;
    totalAmount += line_total;
    newItems.push({
      transaction_item_id: nextItemId++,
      transaction_id: nextTransactionId,
      product_id: product.product_id,
      quantity,
      unit_price: product.unit_price,
      line_total,
    });
  }

  const newTransaction = {
    transaction_id: nextTransactionId,
    customer_id: Number(customer_id),
    store_id: Number(store_id),
    transaction_date: new Date().toISOString(),
    payment_method: payment_method ?? "card",
    status: "completed",
    total_amount: Math.round(totalAmount * 100) / 100,
    created_at: new Date().toISOString(),
  };

  transactions.push(newTransaction);
  transactionItems.push(...newItems);

  res.status(201).json(withItems(newTransaction));
});

export default router;
