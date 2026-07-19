import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createWithdrawalSchema } from "../schemas/withdrawal.schema.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { requestWithdrawal, paymentWebhook } from "../controllers/withdrawal.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(createWithdrawalSchema), requestWithdrawal);

router.post("/webhook", authorize("ADMIN"), paymentWebhook);

export default router;
