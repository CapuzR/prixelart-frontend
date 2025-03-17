export interface User {
  _id: string
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
  account: string
  token: string
  role: string
  login_count?: number
}
