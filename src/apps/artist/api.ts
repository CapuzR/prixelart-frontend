import axios from "axios"
import { User } from "../../types/user.types"
import { Prixer } from "../../types/prixer.types"

export const getTerms = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/termsAndConditions/read"
  try {
    const response = await axios.get(base_url)
    return response
  } catch (error) {
    console.log(error)
  }
}
