
export interface Movement {
    name: string;
    createdOn: Date;
    createdBy: string;
    date: Date;
    destinatary: string;
    description: string;
    item: object;
    order: string
    price: string;
    type: string;
    value: number;
    _id?: string; 
}