import { Route } from "../domain/Route";

export interface RouteComparisonResult {
  routeId: string;
  baselineIntensity: number;
  comparisonIntensity: number;
  percentDifference: number;
  compliant: boolean;
}

export class ComputeRouteComparison {
  private readonly targetIntensity = 89.3368; // gCO2e/MJ (2% below 91.16)

  execute(routes: Route[]): RouteComparisonResult[] {
    const baseline = routes.find(r => r.isBaseline);
    if (!baseline) {
      throw new Error("No baseline route set");
    }

    return routes
      .filter(r => !r.isBaseline)
      .map(route => {
        const baselineIntensity = baseline.ghgIntensity;
        const comparisonIntensity = route.ghgIntensity;

        const percentDifference =
          ((comparisonIntensity / baselineIntensity) - 1) * 100;

        const compliant = comparisonIntensity <= this.targetIntensity;

        return {
          routeId: route.routeId,
          baselineIntensity: Math.round(baselineIntensity * 100) / 100,
          comparisonIntensity: Math.round(comparisonIntensity * 100) / 100,
          percentDifference: Math.round(percentDifference * 100) / 100,
          compliant,
        };
      });
  }
}
