import axios from "axios"
import { Prixer } from "../../../../types/prixer.types"

export const getAllPrixers = async () => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/prixer/read-all-full"
  try {
    const response = await axios.get(base_url, { withCredentials: true })
    return response.data.prixers
  } catch (e) {
    console.log(e)
  }
}

export const getAllOrgs = async () => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/organization/read-all-full"
  try {
    const response = await axios.get(base_url, { withCredentials: true })
    return response.data.organizations
  } catch (e) {
    console.log(e)
  }
}


