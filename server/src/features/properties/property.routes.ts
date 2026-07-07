import express from "express";
import { getProperties, getProperty, createProperty } from "./property.controller";
import { authMiddleware } from "../auth/auth.middleware";
import multer from "multer";

const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, AVIF`));
    }
  },
});

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", authMiddleware(["manager"]), upload.array("photos"), createProperty);

export default router;
