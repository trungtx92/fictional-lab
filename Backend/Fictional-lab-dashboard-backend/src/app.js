import express from "express";
import cors from "cors";

import overviewRouter from "./routes/overview.js";
import statesRouter from "./routes/states.js";
import chatRouter from "./routes/chat.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/healthz", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/overview", overviewRouter);
  app.use("/api/states", statesRouter);
  app.use("/api/chat", chatRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // express.json() rejects a body that is not valid JSON.
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
