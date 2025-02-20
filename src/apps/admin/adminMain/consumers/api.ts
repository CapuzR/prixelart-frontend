import axios from "axios"
import { Consumer } from "../../../../types/consumer.types"

export const getConsumers = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/consumer/read-all"
  try {
    const response = await axios.get(base_url, { withCredentials: true })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const deleteConsumer = async (id: string) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/consumer/delete/" + id
  try {
    const response = await axios.delete(base_url)
    return response
  } catch (error) {
    console.log(error)
  }
}
