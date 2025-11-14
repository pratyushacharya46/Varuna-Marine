// File: backend/src/adapters/inbound/http/poolingRoutes.ts
import express from "express";
import { Pool } from "../../../core/domain/entities/Pool.js";
import { PoolMember } from "../../../core/domain/entities/PoolMember.js";
import { PoolingUseCase } from "../../../core/application/usecases/PoolingUseCase.js";
import { PoolingRepositoryPrisma } from "../../outbound/postgres/PoolingRepositoryPrisma.js";

export const poolingRouter = express.Router();

const repo = new PoolingRepositoryPrisma();
const useCase = new PoolingUseCase();

poolingRouter.post("/", async (req, res) => {
  try {
    const { year, members } = req.body;

    if (!year || !members) {
      return res.status(400).json({ error: "Missing year or members" });
    }

    const poolMembers = members.map((m: any) => new PoolMember(m));

    const pool = useCase.createPool(year, poolMembers);

    const savedPool = await repo.savePool(pool);

    res.json({
      status: "ok",
      totalCB: savedPool.totalCB,
      members: savedPool.members,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

poolingRouter.get("/", async (req, res) => {
  try {
    const pools = await repo.getAllPools();
    res.json(pools);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

poolingRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const pool = await repo.getPoolById(id);

    if (!pool) {
      return res.status(404).json({ error: "Pool not found" });
    }

    res.json(pool);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
