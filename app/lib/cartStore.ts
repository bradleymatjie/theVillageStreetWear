// app/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './types';

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedMaterial: string;
  cartItemId: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, selectedSize: string, selectedMaterial: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // ✅ FIXED addItem
      addItem: (product, selectedSize, selectedMaterial) => {
        const items = get().items;

        // unique ID per variant of a product
        const cartItemId = `${product.id}-${selectedSize}-${selectedMaterial}`;

        const existingItem = items.find((item) => item.cartItemId === cartItemId);

        if (existingItem) {
          // increase quantity of same variant
          set({
            items: items.map((item) =>
              item.cartItemId === cartItemId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // brand new variant
          set({
            items: [
              ...items,
              {
                ...product,
                quantity: 1,
                selectedSize,
                selectedMaterial,
                cartItemId,
              },
            ],
          });
        }
      },

      removeItem: (cartItemId) => {
        set({
          items: get().items.filter((item) => item.cartItemId !== cartItemId),
        });
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = parseFloat(item.price.replace('R', '').replace(',', ''));
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
