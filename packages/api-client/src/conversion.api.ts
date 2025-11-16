import axios from "axios";

interface ConversionRateResponse {
  dollarValue: number;
}

export const fetchConversionRateFromAPI = async (): Promise<number> => {
  try {
    const base_url: string =
      import.meta.env.VITE_BACKEND_URL + "/dollarValue/read";
    const response = await axios.get<ConversionRateResponse>(base_url);

    if (response?.data?.dollarValue == null) {
      throw new Error("Invalid response: dollarValue is missing");
    }

    return response.data.dollarValue;
  } catch (err: unknown) {
    throw new Error("Failed to fetch conversion rate.");
  }
};
