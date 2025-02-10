import axios from "axios"
import { ShippingMethod } from "../../../../types/shippingMethod.types"
import { ObjectId } from "mongodb"

export const getMethods = async () => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/shipping-method/read-all"
  try {
    const response = await axios.post(base_url, { withCredentials: true })
    return response.data.shippingMethods
  } catch (e) {
    console.log(e)
  }
}

export const createMethod = async (data: Partial<ShippingMethod>) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/shipping-method/create"
  try {
    const response = await axios.post(base_url, data, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const updateMethod = async (data: ShippingMethod) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/shipping-method/update"
  try {
    const response = await axios.put(base_url, data, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const deleteMethod = async (id: ObjectId) => {
  const URI = import.meta.env.VITE_BACKEND_URL + "/shipping-method/delete/" + id
  try {
    const response = await axios.delete(URI, { withCredentials: true })
    return response.data
  } catch (error) {
    console.log(error)
  }
}
