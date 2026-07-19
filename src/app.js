import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

const API_PREFIX = "/api";

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// TODO: Mount route modules here
// app.use(`${API_PREFIX}/users`, userRoutes);
// app.use(`${API_PREFIX}/sales`, saleRoutes);
// app.use(`${API_PREFIX}/withdrawals`, withdrawalRoutes);

// ─── 404 Catch-all ───────────────────────────────────────
app.use((req, _res, next) => {
    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

export default app;