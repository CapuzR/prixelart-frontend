import axios from "axios"

export const getServices = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/service/getAllActive"
  try {
    const response = await axios.get(base_url)
    return response.data.services
  } catch (error) {
    console.log(error)
  }
}

export const getServicesByPrixer = async (prixer) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/service/getServiceByPrixer/" + prixer
  try {
    const response = await axios.get(base_url)
    return response.data.services
  } catch (error) {
    console.log(error)
  }
}
