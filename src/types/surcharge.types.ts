export interface Surcharge {
  name: string
  createdOn: Date
  createdBy: string
  date: Date
  destinatary: string
  description: string
  item: object
  order: string
  price: string
  type: string
  value: number
  _id: string
  surchargeId: string
  active: boolean
  appliedProducts: string[]
  appliedUsers: string[]
  appliedPercentage: string
  considerations: object
  owners?: string[]
}
