import express from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { createApplication, listApplications, updateApplicationStatus } from "./application.controller";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), listApplications);
router.post("/", authMiddleware(["tenant"]), createApplication);
router.put("/:id/status", authMiddleware(["manager"]), updateApplicationStatus);

export default router;
