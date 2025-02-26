import axios from "axios"

export const getAllProducts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-allv1"
  try {
    const response = await axios.get(base_url)
    return response.data.products
  } catch (e) {
    console.log(e)
  }
}

export const getSurcharges = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/surcharge/read-active"
  try {
    const response = await axios.get(base_url)
    return response.data.surcharges
  } catch (e) {
    console.log(e)
  }
}
