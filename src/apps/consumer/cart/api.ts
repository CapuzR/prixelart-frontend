import axios from 'axios';
import { Item } from './interfaces';

export const fetchCart = async (): Promise<Item[]> => {
  try {
    const response = await axios.get('/api/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const saveCartItem = async (item: Item): Promise<void> => {
  try {
    await axios.post('/api/cart', item);
  } catch (error) {
    console.error('Error saving cart item:', error);
    throw error;
  }
};

export const updateCartItem = async (id: string, item: Item): Promise<void> => {
  try {
    await axios.put(`/api/cart/${id}`, item);
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const deleteCartItem = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/api/cart/${id}`);
  } catch (error) {
    console.error('Error deleting cart item:', error);
    throw error;
  }
};

export const fetchLineDiscount = async (item: Item, quantity: number): Promise<number> => {
  try {
    const response = await axios.get('/api/discount', {
      params: {
        itemId: item.sku,
        productId: item.product?.id,
        artId: item.art?.artId,
        quantity,
      },
    });
    return response.data.discount || 0;
  } catch (error) {
    console.error('Error fetching line discount:', error);
    return 0;
  }
};
