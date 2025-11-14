// File: backend/prisma/seedRoutes.ts

import { prisma } from "../src/infrastructure/db/prismaClient.js";

async function main() {
  await prisma.route.deleteMany(); // clean for repeatability

  await prisma.route.createMany({
    data: [
      {
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
      },
      {
        routeId: "R002",
        vesselType: "BulkCarrier",
        fuelType: "LNG",
        year: 2024,
        ghgIntensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
      },
      {
        routeId: "R003",
        vesselType: "Tanker",
        fuelType: "MGO",
        year: 2024,
        ghgIntensity: 93.5,
        fuelConsumption: 5100,
        distance: 12500,
        totalEmissions: 4700,
      },
      {
        routeId: "R004",
        vesselType: "RoRo",
        fuelType: "HFO",
        year: 2025,
        ghgIntensity: 89.2,
        fuelConsumption: 4900,
        distance: 11800,
        totalEmissions: 4300,
      },
      {
        routeId: "R005",
        vesselType: "Container",
        fuelType: "LNG",
        year: 2025,
        ghgIntensity: 90.5,
        fuelConsumption: 4950,
        distance: 11900,
        totalEmissions: 4400,
      },
    ],
  });

  console.log("Seeded routes.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
