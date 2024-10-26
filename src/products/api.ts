import axios from 'axios';
import { Product } from './interfaces';

const base_url = process.env.REACT_APP_BACKEND_URL;


interface FetchProductDetailsAPIResponse {
  info: string;
  product: Product;
};

export const fetchProductDetails = async (productId: string): Promise<Product> => {
  const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read_v2";
  
  try {
    const response = await axios.get<FetchProductDetailsAPIResponse>(base_url, { params: { _id: productId } });
    return response.data.product;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};

interface FetchVariantPriceAPIResponse {
  info: string;
  price: string;
};

export const fetchVariantPrice = async (variantId: String, artId?: String): Promise<string> => {
  try {
    const response = await axios.get<FetchVariantPriceAPIResponse>(`${base_url}/product/getVariantPrice`, {
      params: { variantId, artId: artId || null },
    });
    return response.data.price;
  } catch (error) {
    console.error('Error fetching variant price:', error);
    return null;
  }
};

interface FetchProductsAPIResponse {
  info: string;
  products: Product[];
  maxLength: number;
}

interface FetchProductsResponse {
  products: Product[];
  maxLength: number;
}

export const fetchProducts = async (order: string, currentPage: number, productsPerPage: number): Promise<FetchProductsResponse> => {
  const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all-v2";
  const params = {
    orderType: order === "A-Z" || order === "lowerPrice" ? "asc" : order === "" ? "" : "desc",
    sortBy: order === "lowerPrice" || order === "maxPrice" ? "priceRange" : order === "" ? "" : "name",
    initialPoint: (currentPage - 1) * productsPerPage,
    productsPerPage: productsPerPage
  };
  const response = await axios.get<FetchProductsAPIResponse>(base_url, { params });

  return { products: response.data.products, maxLength: response.data.maxLength };
};

interface FetchBestSellersAPIResponse {
  info: string;
  products: Product[];
}

export const fetchBestSellers = async (): Promise<Product[]> => {
  const base_url = process.env.REACT_APP_BACKEND_URL + "/getBestSellers";
  
  try {
    const response = await axios.get<FetchBestSellersAPIResponse>(base_url);
    return response.data.products;
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
};