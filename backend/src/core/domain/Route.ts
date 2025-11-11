export type VesselType = "Container" | "BulkCarrier" | "Tanker" | "RoRo";
export type FuelType = "HFO" | "LNG" | "MGO";

export interface RouteProps {
  routeId: string;
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline?: boolean;
}

export class Route {
  private props: RouteProps;

  constructor(props: RouteProps) {
    this.props = Object.freeze(props);
  }

  get routeId() { return this.props.routeId; }
  get vesselType() { return this.props.vesselType; }
  get fuelType() { return this.props.fuelType; }
  get year() { return this.props.year; }
  get ghgIntensity() { return this.props.ghgIntensity; }
  get fuelConsumption() { return this.props.fuelConsumption; }
  get distance() { return this.props.distance; }
  get totalEmissions() { return this.props.totalEmissions; }
  get isBaseline() { return this.props.isBaseline ?? false; }

  setBaseline(): Route {
    return new Route({ ...this.props, isBaseline: true });
  }
}
