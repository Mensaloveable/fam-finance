import { Router } from "express";
import { AuthController } from "../../controllers/auth.controller.js";

const router = Router();
const authController = new AuthController();

// Signup
router.post("/signup", authController.signup);

// Login
router.post("/login", authController.login);

export default router;
