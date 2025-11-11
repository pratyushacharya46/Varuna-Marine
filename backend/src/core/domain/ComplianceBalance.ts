export class ComplianceBalance {
    constructor(public readonly value: number) {}
  
    isSurplus(): boolean {
      return this.value > 0;
    }
  
    isDeficit(): boolean {
      return this.value < 0;
    }
  
    add(amount: number): ComplianceBalance {
      return new ComplianceBalance(this.value + amount);
    }
  
    subtract(amount: number): ComplianceBalance {
      return new ComplianceBalance(this.value - amount);
    }
  }
  