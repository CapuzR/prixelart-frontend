export interface Organization {
  _id: string
  orgId?: string
  firstName: string
  lastName: string
  email: string
  specialtyArt: string[]
  specialty?: string
  description: string
  instagram: string
  twitter: string
  facebook: string
  dateOfBirth: string
  phone: string
  country: string
  city: string
  shortShot: string
  username: string
  avatar: string
  status: boolean
  termsAgree: boolean
  bio: object
  prixerId: string
  account: string
  agreement: {
    comission: number
    appliedProducts: string[]
    base: string
    considerations: {
      artista: number
      corporativo: number
      da: number
      prixer: number
    }
  }
}
