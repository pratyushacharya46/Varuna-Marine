// File: src/core/application/usecases/PoolingUseCase.test.ts
import { PoolMember } from "../../domain/entities/Pool.ts";
import { PoolingUseCase } from "./PoolingUseCase.ts";

(async () => {
  const useCase = new PoolingUseCase();

  const members = [
    new PoolMember({ shipId: "Ship-A", cbBefore: 3000 }),  // surplus
    new PoolMember({ shipId: "Ship-B", cbBefore: -1000 }), // deficit
    new PoolMember({ shipId: "Ship-C", cbBefore: -1500 })  // deficit
  ];

  const pool = useCase.createPool(2025, members);

  console.log("✅ Pool valid:", pool.isValid());
  console.table(pool.members.map(m => ({
    ship: m.shipId,
    before: m.cbBefore,
    after: m.cbAfter
  })));
})();
