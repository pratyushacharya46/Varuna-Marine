export interface BankEntryProps {
    shipId: string;
    year: number;
    amountGCO2eq: number; // positive CB stored
    createdAt?: Date;
  }
  
  export class BankEntry {
    readonly shipId: string;
    readonly year: number;
    readonly amountGCO2eq: number;
    readonly createdAt: Date;
  
    constructor(props: BankEntryProps) {
      if (props.amountGCO2eq <= 0) {
        throw new Error("Banked amount must be positive.");
      }
  
      this.shipId = props.shipId;
      this.year = props.year;
      this.amountGCO2eq = props.amountGCO2eq;
      this.createdAt = props.createdAt ?? new Date();
    }
  }
  