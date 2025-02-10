import axios from "axios"
import { ObjectId } from "mongodb"
import { PaymentMethod } from "../../../../types/paymentMethod.types"

export const getMethods = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/payment-method/read-all"
  try {
    const response = await axios.post(base_url, { withCredentials: true })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const deleteMethod = async (id: ObjectId) => {
  const URI = import.meta.env.VITE_BACKEND_URL + "/payment-method/delete/" + id
  try {
    const response = await axios.delete(URI, { withCredentials: true })
    return response
  } catch (error) {
    console.log(error)
  }
}
