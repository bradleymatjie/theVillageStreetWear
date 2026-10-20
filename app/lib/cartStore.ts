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
  hasHydrated: boolean;
  completedOrderIds: string[];
  reconcilePaidOrder: (orderId: string, purchased: { cart_item_id: string; quantity: number }[]) => void;

  setHasHydrated: (state: boolean) => void;

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
      hasHydrated: false,
      completedOrderIds: [],
      reconcilePaidOrder: (orderId, purchased) => {
        set((state) => {
          if (state.completedOrderIds.includes(orderId)) return state;
          const quantities = new Map<string, number>();
          for (const item of purchased) {
            if (Number.isInteger(item.quantity) && item.quantity > 0) quantities.set(item.cart_item_id, (quantities.get(item.cart_item_id) || 0) + item.quantity);
          }
          return {
            items: state.items.map(item => ({ ...item, quantity: Math.max(0, item.quantity - (quantities.get(item.cartItemId) || 0)) })).filter(item => item.quantity > 0),
            completedOrderIds: [...state.completedOrderIds, orderId],
          };
        });
      },

      setHasHydrated: (state) => set({ hasHydrated: state }),

      addItem: (product, selectedSize, selectedMaterial) => {
        const items = get().items;
        const cartItemId = `${product.id}-${selectedSize}-${selectedMaterial}`;

        const existingItem = items.find(
          (item) => item.cartItemId === cartItemId
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.cartItemId === cartItemId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
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
          items: get().items.filter(
            (item) => item.cartItemId !== cartItemId
          ),
        });
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((total, item) => {
          const price = parseFloat(
            item.price.replace('R', '').replace(',', '')
          );
          return total + price * item.quantity;
        }, 0),
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
