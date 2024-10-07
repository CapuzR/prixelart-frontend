import axios from 'axios';

const base_url = process.env.REACT_APP_BACKEND_URL;

/**
 * Fetches the price for a given variant ID from the backend.
 * @param {string} variantId - The ID of the variant.
 * @returns {number|null} - The price of the variant or null if there's an error.
 */
export const getVariantPrice = async (variantId, artId) => {
  try {
    const response = await axios.get(`${base_url}/product/getVariantPrice`, {
      params: { variantId, artId: artId ? artId : null },
    });
    return response.data.price;
  } catch (error) {
    console.error('Error fetching variant price:', error);
    return null;
  }
};

export const fetchProducts = async (order, currentPage, productsPerPage) => {
  const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all-v2";
  const params = {
    orderType: order === "A-Z" || order === "lowerPrice" ? "asc" : order === "" ? "" : "desc",
    sortBy: order === "lowerPrice" || order === "maxPrice" ? "priceRange" : order === "" ? "" : "name",
    initialPoint: (currentPage - 1) * productsPerPage,
    productsPerPage: productsPerPage
  };

  const response = await axios.get(base_url, { params });
  return response.data;
};

export const fetchProductDetails = async (productId) => {
  const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read_v2";
  
  try {
    const response = await axios.get(base_url, { params: { _id: productId } });
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;  // Handle error at the component level
  }
};