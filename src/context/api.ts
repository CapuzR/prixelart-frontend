import axios from 'axios';

export const fetchConversionRateFromAPI = async () => {
  try {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/dollarValue/read';
    const response = await axios.get(base_url);

    if (response?.data?.dollarValue == null) {
      throw new Error('Invalid response: dollarValue is missing');
    }

    return response.data.dollarValue;
  } catch (err) {
    console.error('Error fetching conversion rate:', err);
    throw new Error('Failed to fetch conversion rate.');
  }
};
