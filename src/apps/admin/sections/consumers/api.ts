import axios from "axios"
import { Consumer } from "../../../../types/consumer.types"
import UpdateConsumer from "./views/Update"

export const getConsumers = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/consumer/read-all"
  try {
    const response = await axios.get(base_url, { withCredentials: true })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const getPrixers = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/consumer/read-prixers"

  try {
    const response = await axios.get(base_url)
    return response.data
  } catch (error) {
    console.log(error)
  }
}
export const deleteConsumer = async (id: string) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/consumer/delete/" + id
  try {
    const response = await axios.delete(base_url)
    return response
  } catch (error) {
    console.log(error)
  }
}

export const createConsumer = async (data: Partial<Consumer>) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/consumer/create"
  try {
    const response = await axios.post(base_url, data)
    return response
  } catch (error) {
    console.log(error)
  }
}

export const updateConsumer = async (data: Partial<Consumer>) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/consumer/update"
  try {
    const response = await axios.post(base_url, data)
    return response
  } catch (error) {
    console.log(error)
  }
}
