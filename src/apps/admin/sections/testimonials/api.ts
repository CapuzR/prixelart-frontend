import axios from "axios"

export const getTestimonials = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/testimonial/read-all"
  try {
    const response = await axios.get(base_url)

    const responsev2 = response.data.testimonials.sort(function (a, b) {
      return a.position - b.position
    })
    return responsev2
  } catch (error) {
    console.log(error)
  }
}
