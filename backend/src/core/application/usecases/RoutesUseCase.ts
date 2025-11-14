// File: backend/src/core/application/usecases/RoutesUseCase.ts

import { RouteRepositoryPrisma } from "../../../adapters/outbound/postgres/RouteRepositoryPrisma.js";

export class RoutesUseCase {
  private repo: RouteRepositoryPrisma;

  constructor() {
    this.repo = new RouteRepositoryPrisma();
  }

  async getRoutes() {
    return this.repo.getAll();
  }

  async setBaseline(routeId: string) {
    return this.repo.setBaseline(routeId);
  }

  async getComparisons() {
    const baseline = await this.repo.getBaseline();
    if (!baseline) throw new Error("No baseline route set.");

    const others = await this.repo.getOthers(baseline.routeId);

    return others.map((r) => {
      const percentDiff = ((r.ghgIntensity / baseline.ghgIntensity) - 1) * 100;

      return {
        routeId: r.routeId,
        baselineGHG: baseline.ghgIntensity,
        comparisonGHG: r.ghgIntensity,
        percentDiff,
        compliant: r.ghgIntensity <= 89.3368,
      };
    });
  }
}
