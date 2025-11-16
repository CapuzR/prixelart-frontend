import { ObjectId } from "mongodb";

type AdjustmentMethod = 'absolute' | 'percentage';
type Entity = 'seller' | 'user' | 'prixer' | 'organization' | 'manufacturer';

export interface ApplicableEntity {
  id?: string; // the Id of the Entity if it is a specific one instead of a group
  name?: string;
  type: Entity; // the type of entity
  adjustmentMethod: AdjustmentMethod; // absolute or percentage
  customValue?: number; // amount
}

export interface Surcharge {
  _id?: ObjectId;
  name: string;
  description: string;
  active: boolean;
  adjustmentMethod: AdjustmentMethod; // Defines whether the adjustment is an absolute amount or a percentage.
  defaultValue: number;  // The value to adjust by – for percentage decimals as needed.
  applicableProducts?: string[]; // applicable product IDs for surcharge
  applicableArts?: string[]; // applicable art IDs for surcharge
  entityOverrides?: ApplicableEntity[]; // overrides for specific users or groups of users
  appliesToAllProducts: boolean;
  appliestoAllArts: boolean;
  recipients?: ApplicableEntity[]; // who receives the surcharge (A quien le van los riales extra)
  dateRange?: {
    start: Date;
    end: Date;
  };
}