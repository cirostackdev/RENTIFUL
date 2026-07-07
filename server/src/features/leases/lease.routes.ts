import express from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { getLeases, getLeasePayments } from "./lease.controller";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get("/:id/payments", authMiddleware(["manager", "tenant"]), getLeasePayments);

export default router;
