// File: backend/src/adapters/outbound/postgres/RouteRepositoryPrisma.ts

import { prisma } from "../../../infrastructure/db/prismaClient.js";
import { Route } from "../../../core/domain/entities/Route.js";

export class RouteRepositoryPrisma {
  async getAll(): Promise<Route[]> {
    const rows = await prisma.route.findMany();

    return rows.map((r) => new Route({
      routeId: r.routeId,
      vesselType: r.vesselType as any,
      fuelType: r.fuelType as any,
      year: r.year,
      ghgIntensity: r.ghgIntensity,
      fuelConsumption: r.fuelConsumption,
      distance: r.distance,
      totalEmissions: r.totalEmissions,
      isBaseline: r.isBaseline,
    }));
  }

  async getBaseline(): Promise<Route | null> {
    const r = await prisma.route.findFirst({
      where: { isBaseline: true }
    });

    return r ? new Route(r as any) : null;
  }

  async setBaseline(routeId: string): Promise<Route> {
    // Ensure target route exists first to provide a clearer error if not found
    const existing = await prisma.route.findUnique({ where: { routeId } });
    if (!existing) throw new Error(`Route '${routeId}' not found.`);

    // Perform the clear-and-set in a transaction so it's atomic
    const [, r] = await prisma.$transaction([
      prisma.route.updateMany({ data: { isBaseline: false } }),
      prisma.route.update({ where: { routeId }, data: { isBaseline: true } })
    ]);

    return new Route(r as any);
  }

  async getOthers(excludedRouteId: string): Promise<Route[]> {
    const rows = await prisma.route.findMany({
      where: { routeId: { not: excludedRouteId } }
    });

    return rows.map((r) => new Route(r as any));
  }
}
