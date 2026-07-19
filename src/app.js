import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import saleRoutes from "./routes/sale.routes.js";
import advanceRoutes from "./routes/advance.routes.js";
import withdrawalRoutes from "./routes/withdrawal.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const API_PREFIX = "/api/v1";

app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/sales`, saleRoutes);
app.use(`${API_PREFIX}/advance`, advanceRoutes);
app.use(`${API_PREFIX}/withdraw`, withdrawalRoutes);

app.use((req, _res, next) => {
    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

export default app;