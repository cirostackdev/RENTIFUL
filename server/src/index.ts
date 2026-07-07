import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";

import { authMiddleware } from "./features/auth/auth.middleware";
import authRoutes from "./features/auth/auth.routes";
import propertyRoutes from "./features/properties/property.routes";
import applicationRoutes from "./features/applications/application.routes";
import leaseRoutes from "./features/leases/lease.routes";
import tenantRoutes from "./features/tenants/tenant.routes";
import managerRoutes from "./features/managers/manager.routes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/applications", applicationRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", authMiddleware(["tenant", "manager"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
);

const port = Number(process.env.PORT) || 3002;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
