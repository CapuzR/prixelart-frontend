import axios from "axios"
import { Order } from "../../../../types/order.types"

export const getOrder = async (id) => {
  const url = import.meta.env.VITE_BACKEND_URL + "/order/read"
  const response = await axios.post(url, {
    order: id,
  })
  return response.data
}
