import axios from 'axios';
import { CartItem } from 'cart/interfaces';

// Fetch cart from backend
export const fetchCart = async (): Promise<CartItem[]> => {
  const response = await axios.get('/api/cart');
  return response.data;
};

// Save cart item to backend
export const saveCartItem = async (item: CartItem): Promise<void> => {
  await axios.post('/api/cart', item);
};

// Update cart item in backend
export const updateCartItem = async (id: string, item: CartItem): Promise<void> => {
  await axios.put(`/api/cart/${id}`, item);
};

// Delete cart item from backend
export const deleteCartItem = async (id: string): Promise<void> => {
  await axios.delete(`/api/cart/${id}`);
};
