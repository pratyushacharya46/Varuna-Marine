import { BankingUseCase, type BankingRepository } from "./BankingUseCase.ts";
import { BankEntry } from "../../domain/entities/BankEntry.ts";





class InMemoryBankRepo implements BankingRepository {
  private entries: BankEntry[] = [];

  async save(entry: BankEntry): Promise<void> {
    this.entries.push(entry);
  }

  async getBankedAmount(shipId: string, year: number): Promise<number> {
    return this.entries
      .filter(e => e.shipId === shipId && e.year === year)
      .reduce((sum, e) => sum + e.amountGCO2eq, 0);
  }

  async applyBankedAmount(shipId: string, year: number, amount: number): Promise<void> {
    // reduce oldest entries first
    let remaining = amount;
    for (const e of this.entries) {
      if (e.shipId === shipId && e.year === year && remaining > 0) {
        const applied = Math.min(e.amountGCO2eq, remaining);
        (e as any).amountGCO2eq -= applied;
        remaining -= applied;
      }
    }
  }
}

// simple test
(async () => {
  const repo = new InMemoryBankRepo();
  const useCase = new BankingUseCase(repo);

  await useCase.bankSurplus("Ship-01", 2025, 2000);
  await useCase.bankSurplus("Ship-01", 2025, 1500);

  const applied = await useCase.applyBankedSurplus("Ship-01", 2025, -2500);
  console.log("✅ Applied:", applied);

  const remaining = await repo.getBankedAmount("Ship-01", 2025);
  console.log("🏦 Remaining bank:", remaining);
})();
