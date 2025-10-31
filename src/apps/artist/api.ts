import axios from "axios";

export const getTerms = async () => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/termsAndConditions/read";
  try {
    const response = await axios.get(base_url);
    return response;
  } catch (error) {
    console.log(error);
  }
};
