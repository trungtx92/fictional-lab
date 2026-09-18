import express from "express";
import cors from "cors";

import customersRouter from "./routes/customers.js";
import storesRouter from "./routes/stores.js";
import productsRouter from "./routes/products.js";
import transactionsRouter from "./routes/transactions.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/healthz", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/customers", customersRouter);
  app.use("/api/stores", storesRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/transactions", transactionsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
