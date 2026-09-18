import { Router } from "express";
import { products } from "../data/mockData.js";

const router = Router();

router.get("/", (req, res) => {
  const { category, active } = req.query;
  let result = products;
  if (category) {
    result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (active !== undefined) {
    const wantActive = active === "true";
    result = result.filter((p) => p.is_active === wantActive);
  }
  res.json(result);
});

router.get("/:id", (req, res) => {
  const product = products.find((p) => p.product_id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

export default router;
