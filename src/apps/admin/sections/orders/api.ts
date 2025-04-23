import axios from "axios"
import { Order } from "../../../../types/order.types"
import { Consumer } from "../../../../types/consumer.types"

export const getOrder = async (id: string) => {
  const url = import.meta.env.VITE_BACKEND_URL + "/order/read"
  const response = await axios.post(url, {
    order: id,
  })
  return response.data
}

export const getOrders = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/order/read-all"

  try {
    const response = await axios.post(base_url)
    // change to GET but need change in backend too, comment to Megalinker
    return response.data.orders
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

export const getClients = async () => {
  const URI = import.meta.env.VITE_BACKEND_URL + "/order/getClients"
  try {
    const response = await axios.get(URI)
    return response.data.clients
  } catch (error) {
    console.log(error)
  }
}

export const getDiscounts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/read-allv2"
  try {
    const response = await axios.post(base_url)
    return response.data.discounts
  } catch (error) {
    console.log(error)
  }
}

export const getSurcharges = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/surcharge/read-active"
  try {
    const response = await axios.get(base_url)
    return response.data.surcharges
  } catch (error) {
    console.log(error)
  }
}

export const getOrganizations = async () => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/organization/read-all-full"
  try {
    const response = await axios.get(base_url)
    return response.data.organizations
  } catch (error) {
    console.log(error)
  }
}

export const getShippingMethods = async () => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/shipping-method/read-all-v2"
  try {
    const response = await axios.get(base_url)

    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const getConsumers = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/consumer/read-all"
  try {
    const response = await axios.post(base_url)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const getPrixers = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer/read-all-full"
  try {
    const response = await axios.get(base_url)
    return response.data.prixers
  } catch (error) {
    console.log(error)
  }
}

export const getProducts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-all"
  try {
    const response = await axios.get(base_url)
    return response.data.products
  } catch (error) {
    console.log(error)
  }
}

export const getArts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/art/read-all"
  try {
    const response = await axios.get(base_url)
    return response.data.arts
  } catch (error) {
    console.log(error)
  }
}

export const getConsumer = async (id: string) => {
  try {
    const url = import.meta.env.VITE_BACKEND_URL + "/consumer/read-by-id"

    const body = {
      consumer: id,
    }
    const response = await axios.post(url, body)
    return response.data
  } catch (error) {
    console.log(error)
  }
}
