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

export const getDiscounts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/read-allv1"
  try {
    const response = await axios.get(base_url)
    return response.data.discounts
  } catch (error) {
    console.log(error)
  }
}

export const getCategories = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-categories"
  try {
    const response = await axios.get(base_url)
    return response.data.categories
  } catch (error) {
    console.log(error)
  }
}
