import axios from "axios"
import { Prixer } from "../../../../types/prixer.types"

export const getAllPrixers = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer/read-all-full"
  try {
    const response = await axios.get(base_url, { withCredentials: true })

    let prev = response.data.prixers
    prev.map((prix) => {
      if (prix !== null) {
        return prix
      }
    })

    return prev
  } catch (e) {
    console.log(e)
  }
}

export const getAllOrgs = async () => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/organization/read-all-full"
  try {
    const response = await axios.get(base_url, { withCredentials: true })
    return response.data.organizations
  } catch (e) {
    console.log(e)
  }
}

export const getAccounts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/account/readAll"
  try {
    const response = await axios.get(base_url)
    return response.data.accounts
  } catch (error) {
    console.log(error)
  }
}

export const getMovementsForPrixer = async (account: string) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/movement/readByPrixer/" + account
  try {
    const response = await axios.get(base_url)
    return response.data.movements
  } catch (error) {
    console.log(error)
  }
}

export const updateToOrg = async (user: string) => {
  const url = import.meta.env.VITE_BACKEND_URL + "/turn-to-organization"
  try {
    const data = { username: user }
    const response = await axios.put(url, data)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const updateToPrixer = async (user: string) => {
  const url = import.meta.env.VITE_BACKEND_URL + "/turn-to-prixer"
  try {
    const data = { username: user }
    const response = await axios.post(url, data)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const updateVisibility = async (body) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/prixer/update-home/" + body.id
  try {
    const response = await axios.put(base_url, body)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const createAccount = async (data) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/account/create"
  try {
    const response = await axios.post(base_url, data)
    return response
  } catch (error) {
    console.log(error)
  }
}

export const createMovement = async (data) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/movement/create"
  try {
    const response = await axios.post(base_url, data)
    return response
  } catch (error) {
    console.log(error)
  }
}

export const deletePrixer = async (data) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/prixers/destroyPrixer"
  try {
    const response = await axios.put(base_url, data)
    return response
  } catch (error) {
    console.log(error)
  }
}
