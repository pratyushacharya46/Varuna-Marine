// File: backend/src/adapters/inbound/http/bankingRoutes.ts
import express from "express";
import { BankingUseCase } from "../../../core/application/usecases/BankingUseCase.js";
import { BankingRepositoryPrisma } from "../../outbound/postgres/BankingRepositoryPrisma.js";

export const bankingRouter = express.Router();

type Request = express.Request;
type Response = express.Response;

// ✅ Use the real Prisma repository (persistent storage)
const repo = new BankingRepositoryPrisma();
const useCase = new BankingUseCase(repo);

/**
 * GET /banking/balance
 * Returns total banked CB for a ship and year
 */
bankingRouter.get("/balance", async (req: Request, res: Response) => {
  try {
    const shipId = req.query.shipId as string;
    const year = Number(req.query.year);

    if (!shipId || Number.isNaN(year)) {
      throw new Error("Missing or invalid shipId/year");
    }

    const amount = await repo.getBankedAmount(shipId, year);
    res.json({ amountGCO2eq: amount });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /banking/bank
 * Saves a positive CB entry
 */
bankingRouter.post("/bank", async (req: Request, res: Response) => {
  try {
    const { shipId, year, cb } = req.body;

    if (!shipId || typeof year !== "number" || typeof cb !== "number") {
      throw new Error("Invalid shipId/year/cb");
    }

    const entry = await useCase.bankSurplus(shipId, year, cb);
    res.json({ status: "ok", entry });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /banking/apply
 * Applies previously banked CB to a deficit
 */
bankingRouter.post("/apply", async (req: Request, res: Response) => {
  try {
    const { shipId, year, deficit } = req.body;

    if (!shipId || typeof year !== "number" || typeof deficit !== "number") {
      throw new Error("Invalid shipId/year/deficit");
    }

    const result = await useCase.applyBankedSurplus(shipId, year, deficit);
    res.json({ status: "ok", result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
