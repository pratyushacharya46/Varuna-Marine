// File: backend/src/core/domain/entities/Pool.ts
import { PoolMember } from "./PoolMember.js";

export class Pool {
  year: number;
  members: PoolMember[];

  constructor(year: number, members: PoolMember[]) {
    this.year = year;
    this.members = members;
  }

  get totalCB(): number {
    return this.members.reduce((sum, m) => sum + m.cbAfter, 0);
  }
}

export { PoolMember };
