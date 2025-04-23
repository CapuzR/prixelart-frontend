import { SourceProduct } from '../../../types/api.types';
import axios from 'axios';

const base_url = import.meta.env.VITE_BACKEND_URL;

export const fetchProductDetails = async (productId: string): Promise<SourceProduct> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/product/read/${productId}`;

  try {
    const response = await axios.get<{ info: string, product: SourceProduct }>(url);
    return response.data.product;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

export const fetchVariantPrice = async (variantId: String, productId: String): Promise<string> => {
  try {
    const response = await axios.get<{ info: string, price: string }>(
      `${base_url}/product/getVariantPrice`,
      {
        params: { variantId, productId: productId || null },
      }
    );
    return response.data.price;
  } catch (error) {
    console.error('Error fetching variant price:', error);
    return "";
  }
};

interface FetchProductsResponse {
  products: SourceProduct[];
  maxLength: number;
}

export const fetchProducts = async (
  order: string, currentPage: number, productsPerPage: number, search?: string): Promise<FetchProductsResponse> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + '/product/read-all-v2';
  const params = {
    orderType: order === 'A-Z' || order === 'lowerPrice' ? 'asc' : order === '' ? '' : 'desc',
    sortBy:
      order === 'lowerPrice' || order === 'maxPrice' ? 'priceRange' : order === '' ? '' : 'name',
    initialPoint: search ? 0 : (currentPage - 1) * productsPerPage,
    productsPerPage: search ? 1000 : productsPerPage,
  };
  const response = await axios.get(base_url, {
    params,
  });

  return {
    products: response.data.products,
    maxLength: response.data.maxLength,
  };
};

export const fetchBestSellers = async (): Promise<SourceProduct[]> => {

  const url = import.meta.env.VITE_BACKEND_URL + '/product/bestSellers';
  try {
    const { data } = await axios.get(url);
    return data.products;
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return [];
  }
};
