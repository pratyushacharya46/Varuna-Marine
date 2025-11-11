import { Route } from "../domain/Route";
import { ComplianceBalance } from "../domain/ComplianceBalance";

export interface ComputeCBInput {
  route: Route;
  targetIntensity: number; // gCO2e/MJ
}

export class ComputeComplianceBalance {
  execute(input: ComputeCBInput): ComplianceBalance {
    const { route, targetIntensity } = input;

    const actual = route.ghgIntensity;
    const energyInScope = route.fuelConsumption * 41000; // MJ

    const cbValue = (targetIntensity - actual) * energyInScope;

    return new ComplianceBalance(Math.round(cbValue));
  }
}
