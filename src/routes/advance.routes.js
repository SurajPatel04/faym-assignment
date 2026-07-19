import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { runAdvancePayouts } from "../controllers/advance.controller.js";

import { authorize } from "../middlewares/authorization.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/run", authorize("ADMIN"), runAdvancePayouts);

export default router;
