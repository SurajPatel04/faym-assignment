import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSaleSchema, updateSaleStatusSchema } from "../schemas/sale.schema.js";
import { createSale, getSales, updateSaleStatus } from "../controllers/sale.controller.js";

import { authorize } from "../middlewares/authorization.middleware.js";
import { paginate } from "../middlewares/pagination.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(createSaleSchema), createSale);

router.get("/", paginate, getSales);

router.patch("/:id/status", authorize("ADMIN"), validate(updateSaleStatusSchema), updateSaleStatus);

export default router;
