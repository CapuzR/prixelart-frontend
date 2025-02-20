export interface Discount {
    _id: string;
    name: string;
    description?: string;
    active: boolean;
    type: string;
    value: number;
    appliedProducts: string[];
    applyBy: string;
    applyFor:  string[];
    appliedPercentage: string;
  
  }
  