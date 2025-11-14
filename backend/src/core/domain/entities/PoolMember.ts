// File: backend/src/core/domain/entities/PoolMember.ts

export class PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;

  constructor({
    shipId,
    cbBefore,
    cbAfter,
  }: {
    shipId: string;
    cbBefore: number;
    cbAfter: number;
  }) {
    this.shipId = shipId;
    this.cbBefore = cbBefore;
    this.cbAfter = cbAfter;
  }
}
