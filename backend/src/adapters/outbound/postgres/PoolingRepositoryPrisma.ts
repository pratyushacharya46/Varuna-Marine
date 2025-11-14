// File: backend/src/adapters/outbound/postgres/PoolingRepositoryPrisma.ts
import { prisma } from "../../../infrastructure/db/prismaClient.js";
import { Pool } from "../../../core/domain/entities/Pool.js";
import { PoolMember } from "../../../core/domain/entities/PoolMember.js";

export class PoolingRepositoryPrisma {
  /**
   * Save a fully evaluated Pool object into the database.
   * All validation should already be done in the UseCase,
   * but we still guard against empty/invalid structures.
   */
  async savePool(pool: Pool): Promise<Pool> {
    if (!pool.members || pool.members.length === 0) {
      throw new Error("Cannot save pool without members");
    }

    try {
      const created = await prisma.pool.create({
        data: {
          year: pool.year,
          members: {
            create: pool.members.map((m) => ({
              shipId: m.shipId,
              cbBefore: m.cbBefore,
              cbAfter: m.cbAfter,
            })),
          },
        },
        include: { members: true },
      });

      return new Pool(
        created.year,
        created.members.map(
          (m) =>
            new PoolMember({
              shipId: m.shipId,
              cbBefore: m.cbBefore,
              cbAfter: m.cbAfter,
            })
        )
      );
    } catch (err: any) {
      console.error("❌ Prisma error saving pool:", err);
      throw new Error("Failed to save pool to database");
    }
  }

  /**
   * Fetch all pools sorted by ID.
   */
  async getAllPools(): Promise<Pool[]> {
    const rows = await prisma.pool.findMany({
      include: { members: true },
      orderBy: { id: "asc" },
    });

    return rows.map(
      (p) =>
        new Pool(
          p.year,
          p.members.map(
            (m) =>
              new PoolMember({
                shipId: m.shipId,
                cbBefore: m.cbBefore,
                cbAfter: m.cbAfter,
              })
          )
        )
    );
  }

  /**
   * Fetch a single pool by primary ID.
   */
  async getPoolById(id: number): Promise<Pool | null> {
    const p = await prisma.pool.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!p) return null;

    return new Pool(
      p.year,
      p.members.map(
        (m) =>
          new PoolMember({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter,
          })
      )
    );
  }
}
