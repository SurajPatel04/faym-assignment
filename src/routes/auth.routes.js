import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { register, login, refresh, logout } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refresh);

router.post("/logout", logout);

export default router;
