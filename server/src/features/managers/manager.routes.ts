import express from "express";
import { getManager, getManagerProperties } from "./manager.controller";

const router = express.Router();

router.get("/:userId", getManager);
router.get("/:userId/properties", getManagerProperties);

export default router;
