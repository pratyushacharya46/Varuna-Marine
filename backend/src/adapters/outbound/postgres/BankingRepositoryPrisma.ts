// File: src/adapters/outbound/postgres/BankingRepositoryPrisma.ts
import { PrismaClient } from "@prisma/client";
import { BankEntry } from "../../../core/domain/entities/BankEntry.js";
import type { BankingRepositoryPort } from "../../../core/application/usecases/BankingUseCase.js";

const prisma = new PrismaClient();

export class BankingRepositoryPrisma implements BankingRepositoryPort {
  async save(entry: BankEntry): Promise<void> {
    await prisma.bankEntry.create({
      data: {
        shipId: entry.shipId,
        year: entry.year,
        amountGCO2eq: entry.amountGCO2eq,
      },
    });
  }

  async getBankedAmount(shipId: string, year: number): Promise<number> {
    const rows = await prisma.bankEntry.findMany({
      where: { shipId, year },
    });

    return rows.reduce((sum, e) => sum + e.amountGCO2eq, 0);
  }

  async applyBankedAmount(shipId: string, year: number, amount: number): Promise<void> {
    let remaining = amount;

    const entries = await prisma.bankEntry.findMany({
      where: { shipId, year },
      orderBy: { id: "asc" },
    });

    for (const e of entries) {
      if (remaining <= 0) break;

      const applied = Math.min(e.amountGCO2eq, remaining);

      await prisma.bankEntry.update({
        where: { id: e.id },
        data: { amountGCO2eq: e.amountGCO2eq - applied },
      });

      remaining -= applied;
    }
  }
}
