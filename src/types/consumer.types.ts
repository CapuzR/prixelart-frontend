export interface Consumer {
  _id: string
  active: boolean
  consumerType: string
  firstname: string
  lastname: string
  username: string
  ci: string
  phone: string
  email: string
  address: string
  billingAddress: string
  shippingAddress: string
  contactedBy: object | string
  birthdate: Date
  instagram: string
  facebook: string
  twitter: string
  nationalIdType: string
  nationalId: string
  gender: string
  prixerId: string
}
