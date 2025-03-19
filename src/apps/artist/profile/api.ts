import axios from "axios"
import { User } from "../../../types/user.types"
import { Prixer } from "../../../types/prixer.types"

export const getPrixer = async (username) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer/read"
  try {
    const data = {
      username: username,
    }
    const response = await axios.post(base_url, data)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const updatePrixer = async (data) => {
  // AGREGAR autenticación de Prixers para procesos
  const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer/update"
  try {
    const response = await axios.post(base_url, data)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const getBio = async (username, isOrg) => {
  const base_url = isOrg
    ? import.meta.env.VITE_BACKEND_URL + "/organization/getBio/" + username
    : import.meta.env.VITE_BACKEND_URL + "/prixer/getBio/" + username
  try {
    const response = await axios.get(base_url)
    return response
  } catch (error) {
    console.log(error)
  }
}
