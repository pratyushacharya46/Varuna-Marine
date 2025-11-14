// File: backend/src/core/application/usecases/PoolingUseCase.ts
import { Pool } from "../../domain/entities/Pool.js";
import { PoolMember } from "../../domain/entities/PoolMember.js";

/**
 * Pure pooling allocation logic (NO DATABASE).
 */
export class PoolingUseCase {
  createPool(year: number, members: PoolMember[]): Pool {
    // deep copy
    const list = members.map(
      (m) =>
        new PoolMember({
          shipId: m.shipId,
          cbBefore: m.cbBefore,
          cbAfter: m.cbBefore, // initialize cbAfter
        })
    );

    const total = list.reduce((s, x) => s + x.cbBefore, 0);
    if (total < 0) throw new Error("Invalid pool: total compliance must be >= 0");

    const surplus = list
      .filter((m) => m.cbBefore > 0)
      .sort((a, b) => b.cbBefore - a.cbBefore);

    const deficit = list
      .filter((m) => m.cbBefore < 0)
      .sort((a, b) => a.cbBefore - b.cbBefore);

    // Allocation
    for (const d of deficit) {
      let need = Math.abs(d.cbBefore);

      for (const s of surplus) {
        if (need <= 0) break;

        const available = s.cbAfter ?? 0;
        const xfer = Math.min(available, need);

        s.cbAfter = available - xfer;
        d.cbAfter = (d.cbAfter ?? 0) + xfer;

        need -= xfer;
      }
    }

    // Validation
    for (const m of list) {
      if (m.cbBefore < 0 && m.cbAfter < m.cbBefore)
        throw new Error(`Deficit ship ${m.shipId} exited worse`);
      if (m.cbBefore > 0 && m.cbAfter < 0)
        throw new Error(`Surplus ship ${m.shipId} went negative`);
    }

    return new Pool(year, list);
  }
}
