// File: backend/src/core/application/usecases/BankingUseCase.ts
import { BankEntry } from "../../domain/entities/BankEntry.js";

export interface BankingRepositoryPort {
  save(entry: BankEntry): Promise<void>;
  getBankedAmount(shipId: string, year: number): Promise<number>;
  applyBankedAmount(shipId: string, year: number, amount: number): Promise<void>;
}

export class BankingUseCase {
  constructor(private repo: BankingRepositoryPort) {}

  async bankSurplus(shipId: string, year: number, cb: number): Promise<BankEntry> {
    if (cb <= 0) {
      throw new Error("Only positive CB can be banked.");
    }

    const entry = new BankEntry({
      shipId,
      year,
      amountGCO2eq: cb,
    });

    await this.repo.save(entry);
    return entry;
  }

  async applyBankedSurplus(
    shipId: string,
    year: number,
    deficit: number
  ): Promise<{ applied: number }> {
    if (deficit >= 0) {
      throw new Error("No deficit to apply against.");
    }

    const available = await this.repo.getBankedAmount(shipId, year);
    const required = Math.abs(deficit);
    const applied = Math.min(required, available);

    if (applied > 0) {
      await this.repo.applyBankedAmount(shipId, year, applied);
    }

    return { applied };
  }
}
