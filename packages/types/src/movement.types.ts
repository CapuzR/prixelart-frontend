export interface Movement {
  _id?: string;
  date: Date;
  destinatary?: string;
  description: string;
  type: "Depósito" | "Retiro";
  value: number;
  order?: string;
  createdOn: Date;
  createdBy: string;
  item?: Record<string, File>;
}
