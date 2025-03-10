import axios from "axios"

export const getTerms = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/termsAndConditions/read"
  try {
    const response = await axios.get(base_url)
    return response.data.terms.termsAndConditions
  } catch (error) {
    console.log(error)
  }
}

export const getArts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/art/read-all-v2"
  try {
    const response = await axios.get(base_url)
    return response.data.arts
  } catch (error) {
    console.log(error)
  }
}

export const getArtBestSellers2 = async () => {
  const url = import.meta.env.VITE_BACKEND_URL + "/getArtBestSellers"
  try {
    const response = await axios.get(url)
    return response.data.arts
  } catch (error) {
    console.log(error)
  }
}
export const getArtBestSellers = async () => {
  const url = import.meta.env.VITE_BACKEND_URL + "/art/bestSellers"
  try {
    const response = await axios.get(url)
    return response.data.ref
  } catch (error) {
    console.log(error)
  }
}

export const updateTerms = async (termsAndConditions) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/termsAndConditions/update"
  try {
    const response = await axios.put(base_url, termsAndConditions)
    return response
  } catch (error) {
    console.log(error)
  }
}
