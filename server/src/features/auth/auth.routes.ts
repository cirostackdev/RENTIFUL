import express from "express";
import { register, login, getMe, updateProfile } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware(["tenant", "manager"]), getMe);
router.put("/me", authMiddleware(["tenant", "manager"]), updateProfile);

export default router;
