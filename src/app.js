import express from 'express';
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.use(express.json());


const API_PREFIX = '/api/recruiter';


app.use((req, res, next) => {
    logWarn("Route Not Found", req, {
        context: "ROUTE_NOT_FOUND",
    });

    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

export default app;