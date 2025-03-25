import axios from "axios"
import { Discount } from "../../../../types/discount.types"
import UpdateProduct from "./views/Update"
import { Product } from "../../../../types/product.types"

export const createProduct = async (data: Product) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/create"
  try {
    const response = await axios.post(base_url, data)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const getAllProducts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-allv1"
  try {
    const response = await axios.get(base_url)
    return response.data.products
  } catch (e) {
    console.log(e)
  }
}

export const updateProduct = async (data: FormData, id: string) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + `/product/update/${id}`
  try {
    const response = await axios.put(base_url, data)
    return response.data
  } catch (error) {
    console.log(error)
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

export const createDiscount = async (data: Partial<Discount>) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/create"
  try {
    const response = await axios.post(base_url, data, { withCredentials: true })
    return response.data
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
