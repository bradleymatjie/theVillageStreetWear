import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface BaseElement {
  id: number;
  zIndex: number;
  type: 'text' | 'image';
}

interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  x: number;
  y: number;
  align: string;
  bold: boolean;
  italic: boolean;
}

interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspect: number;
}

export type Element = TextElement | ImageElement;

export interface SavedDesign {
  id: number;
  name: string;
  elements: { 
    front: Element[]; 
    back: Element[] 
  };
  tshirtColor: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  name: string;
  elements: { 
    front: Element[]; 
    back: Element[] 
  };
  tshirtColor: string;
  price: number;
  quantity: number;
  addedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// Store State Interface
interface DesignStoreState {
  // Saved Designs
  savedDesigns: SavedDesign[];
  addDesign: (design: Omit<SavedDesign, 'id' | 'createdAt'>) => SavedDesign;
  updateDesign: (id: number, updates: Partial<SavedDesign>) => void;
  removeDesign: (id: number) => void;
  getDesignById: (id: number) => SavedDesign | undefined;
  clearDesigns: () => void;
  
  // Shopping Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt' | 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateCartItemQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // User (for future use)
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Loading states (for database integration)
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  
  // Database sync status
  lastSyncedAt: string | null;
  markAsSynced: () => void;
}

// Create the store
export const useDesignStore = create<DesignStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      savedDesigns: [],
      cart: [],
      user: null,
      isLoading: false,
      error: null,
      lastSyncedAt: null,

      // Saved Designs Actions
      addDesign: (design) => {
        const newDesign: SavedDesign = {
          ...design,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          savedDesigns: [...state.savedDesigns, newDesign],
          error: null,
        }));
        
        return newDesign;
      },

      updateDesign: (id, updates) => {
        set((state) => ({
          savedDesigns: state.savedDesigns.map((design) =>
            design.id === id
              ? { ...design, ...updates, updatedAt: new Date().toISOString() }
              : design
          ),
          error: null,
        }));
      },

      removeDesign: (id) => {
        set((state) => ({
          savedDesigns: state.savedDesigns.filter((design) => design.id !== id),
          error: null,
        }));
      },

      getDesignById: (id) => {
        return get().savedDesigns.find((design) => design.id === id);
      },

      clearDesigns: () => {
        set({ savedDesigns: [], error: null });
      },

      // Shopping Cart Actions
      addToCart: (item) => {
        const existingItem = get().cart.find(
          (cartItem) =>
            cartItem.tshirtColor === item.tshirtColor &&
            JSON.stringify(cartItem.elements) === JSON.stringify(item.elements)
        );

        if (existingItem) {
          // If item already exists, increment quantity
          set((state) => ({
            cart: state.cart.map((cartItem) =>
              cartItem.id === existingItem.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
            error: null,
          }));
        } else {
          // Add new item
          const newItem: CartItem = {
            ...item,
            id: Date.now(),
            quantity: 1,
            addedAt: new Date().toISOString(),
          };

          set((state) => ({
            cart: [...state.cart, newItem],
            error: null,
          }));
        }
      },

      removeFromCart: (id) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
          error: null,
        }));
      },

      updateCartItemQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
          error: null,
        }));
      },

      clearCart: () => {
        set({ cart: [], error: null });
      },

      getCartTotal: () => {
        return get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      // User Actions
      setUser: (user) => {
        set({ user, error: null });
      },

      // Loading State
      setIsLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Error Handling
      setError: (error) => {
        set({ error });
      },

      // Database Sync
      markAsSynced: () => {
        set({ lastSyncedAt: new Date().toISOString() });
      },
    }),
    {
      name: 'tshirt-design-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        savedDesigns: state.savedDesigns,
        cart: state.cart,
        user: state.user,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// Selectors (for optimized re-renders)
export const useDesigns = () => useDesignStore((state) => state.savedDesigns);
export const useCart = () => useDesignStore((state) => state.cart);
export const useCartTotal = () => useDesignStore((state) => state.getCartTotal());
export const useCartItemCount = () => useDesignStore((state) => state.getCartItemCount());
export const useUser = () => useDesignStore((state) => state.user);
export const useIsLoading = () => useDesignStore((state) => state.isLoading);
export const useError = () => useDesignStore((state) => state.error);

// Database Integration Helpers (for future use)
export const syncDesignsToDatabase = async () => {
  const { savedDesigns, setIsLoading, setError, markAsSynced } = useDesignStore.getState();
  
  setIsLoading(true);
  setError(null);
  
  try {
    // Example API call structure
    const response = await fetch('/api/designs/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designs: savedDesigns }),
    });
    
    if (!response.ok) throw new Error('Failed to sync designs');
    
    markAsSynced();
    return true;
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
    return false;
  } finally {
    setIsLoading(false);
  }
};

export const syncCartToDatabase = async () => {
  const { cart, setIsLoading, setError } = useDesignStore.getState();
  
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart }),
    });
    
    if (!response.ok) throw new Error('Failed to sync cart');
    
    return true;
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
    return false;
  } finally {
    setIsLoading(false);
  }
};

export const loadDesignsFromDatabase = async (userId: string) => {
  const { setIsLoading, setError, markAsSynced } = useDesignStore.getState();
  
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`/api/designs?userId=${userId}`);
    
    if (!response.ok) throw new Error('Failed to load designs');
    
    const designs: SavedDesign[] = await response.json();
    
    useDesignStore.setState({ savedDesigns: designs });
    markAsSynced();
    
    return designs;
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
    return [];
  } finally {
    setIsLoading(false);
  }
};

export default useDesignStore;