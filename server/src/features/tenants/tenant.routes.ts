import express from "express";
import { getTenant, getCurrentResidences, addFavoriteProperty, removeFavoriteProperty } from "./tenant.controller";

const router = express.Router();

router.get("/:userId", getTenant);
router.get("/:userId/current-residences", getCurrentResidences);
router.post("/:userId/favorites/:propertyId", addFavoriteProperty);
router.delete("/:userId/favorites/:propertyId", removeFavoriteProperty);

export default router;
