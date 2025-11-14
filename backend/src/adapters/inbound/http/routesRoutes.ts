// File: backend/src/adapters/inbound/http/routesRoutes.ts

import express from "express";
import { RoutesUseCase } from "../../../core/application/usecases/RoutesUseCase.js";

export const routesRouter = express.Router();
const useCase = new RoutesUseCase();

// GET /routes/comparison
routesRouter.get("/comparison", async (req, res) => {
  try {
    const data = await useCase.getComparisons();
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /routes/:routeId/baseline
routesRouter.post("/:routeId/baseline", async (req, res) => {
  try {
    const { routeId } = req.params;
    const updated = await useCase.setBaseline(routeId);
    res.json({ message: "Baseline updated", route: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /routes
routesRouter.get("/", async (_req, res) => {
  try {
    const routes = await useCase.getRoutes();
    res.json(routes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
