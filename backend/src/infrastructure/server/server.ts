// File: backend/src/infrastructure/server/server.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config";

// ✅ Use .js extensions (important for ESM)
import { bankingRouter } from "../../adapters/inbound/http/bankingRoutes.js";
import { poolingRouter } from "../../adapters/inbound/http/poolingRoutes.js";
import { routesRouter } from "../../adapters/inbound/http/routesRoutes.js";

// ✅ Optional: Add simple request logger (useful for debugging)
const requestLogger = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
};

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger);

// ✅ Mount routers
app.use("/routes", routesRouter);
app.use("/banking", bankingRouter);
app.use("/pools", poolingRouter);

// ✅ Root route
app.get("/", (_req, res) => {
  res.send("✅ FuelEU Compliance Backend is running!");
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
