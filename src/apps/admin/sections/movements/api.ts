import axios from "axios"
import { Movement } from "../../../../types/movement.types"

export const getMovements = async () => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/movement/read-all-movements"
  try {
    const response = await axios.get(base_url, { withCredentials: true })
    return response.data.movements
  } catch (e) {
    console.log(e)
  }
}

export const getDiscounts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/read-allv1"
  try {
    const response = await axios.get(base_url)
    return response.data.discounts
  } catch (error) {
    console.log(error)
  }
}

export const deleteMovement = async (id: string) => {
  const URI = import.meta.env.VITE_BACKEND_URL + "/movement/delete/" + id
  try {
    const response = await axios.delete(URI, { withCredentials: true })
    return response
  } catch (error) {
    console.log(error)
  }
}
