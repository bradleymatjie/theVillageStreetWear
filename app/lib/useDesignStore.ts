import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types (your original + Element types you already had)
export interface BaseElement {
  id: number;
  zIndex: number;
  type: 'text' | 'image';
}

export interface TextElement extends BaseElement {
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
  rotation: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspect: number;
  rotation: number; 
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
  screenshot: string; // Base64 data URL of the design screenshot
  elements: Element[]; // Flattened elements array (front or back)
  view: 'front' | 'back'; // Which side this cart item represents
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
  addDesign: (design: Omit<SavedDesign, 'id' | 'createdAt' | 'updatedAt'>) => SavedDesign;
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
  
  // Current working design (temporary, NOT persisted)
  currentDesign: {
    elements: { front: Element[]; back: Element[] };
    tshirtColor: string;
  };
  currentView: 'front' | 'back';
  selectedElementId: number | null;

  setCurrentTshirtColor: (color: string) => void;
  setCurrentView: (view: 'front' | 'back') => void;
  setSelectedElementId: (id: number | null) => void;
  addElement: (element: Element) => void;
  updateElement: (id: number, updates: Partial<Element>) => void;
  deleteElement: (id: number) => void;
  clearCurrentDesign: () => void;
  loadCurrentFromSaved: (design: SavedDesign) => void;
  
  // User (for future use)
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Loading states
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

      currentDesign: {
        elements: { front: [], back: [] },
        tshirtColor: 'white',
      },
      currentView: 'front',
      selectedElementId: null,

      // Current design actions
      setCurrentTshirtColor: (color) =>
        set((state) => ({
          currentDesign: { ...state.currentDesign, tshirtColor: color },
        })),

      setCurrentView: (view) => set({ currentView: view }),

      setSelectedElementId: (id) => set({ selectedElementId: id }),

      addElement: (element) =>
        set((state) => {
          const currentEls = state.currentDesign.elements[state.currentView];
          return {
            currentDesign: {
              ...state.currentDesign,
              elements: {
                ...state.currentDesign.elements,
                [state.currentView]: [
                  ...currentEls,
                  { ...element, zIndex: currentEls.length },
                ],
              },
            },
            selectedElementId: element.id,
          };
        }),

      updateElement: (id, updates) =>
        set((state) => ({
          currentDesign: {
            ...state.currentDesign,
            elements: {
              ...state.currentDesign.elements,
              [state.currentView]: state.currentDesign.elements[state.currentView].map((el) =>
                el.id === id ? { ...el, ...updates } : el
              ),
            },
          },
        })),

      deleteElement: (id) =>
        set((state) => ({
          currentDesign: {
            ...state.currentDesign,
            elements: {
              ...state.currentDesign.elements,
              [state.currentView]: state.currentDesign.elements[state.currentView].filter(
                (el) => el.id !== id
              ),
            },
          },
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        })),

      clearCurrentDesign: () =>
        set({
          currentDesign: {
            elements: { front: [], back: [] },
            tshirtColor: 'white',
          },
          selectedElementId: null,
          currentView: 'front',
        }),

      loadCurrentFromSaved: (design) =>
        set({
          currentDesign: {
            elements: {
              front: design.elements.front.map((el) => ({ ...el, rotation: el.rotation ?? 0 })),
              back: design.elements.back.map((el) => ({ ...el, rotation: el.rotation ?? 0 })),
            },
            tshirtColor: design.tshirtColor,
          },
          currentView: 'front',
          selectedElementId: null,
        }),

      // Saved Designs Actions (your original)
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

      // Shopping Cart Actions - UPDATED to support screenshot and elements
      addToCart: (item) => {
        const existingItem = get().cart.find(
          (cartItem) =>
            cartItem.tshirtColor === item.tshirtColor &&
            cartItem.view === item.view &&
            JSON.stringify(cartItem.elements) === JSON.stringify(item.elements)
        );

        if (existingItem) {
          set((state) => ({
            cart: state.cart.map((cartItem) =>
              cartItem.id === existingItem.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
            error: null,
          }));
        } else {
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
      name: 'tshirt-design-storage',
      partialize: (state) => ({
        savedDesigns: state.savedDesigns,
        cart: state.cart,
        user: state.user,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// Your original selectors
export const useDesigns = () => useDesignStore((state) => state.savedDesigns);
export const useCart = () => useDesignStore((state) => state.cart);
export const useCartTotal = () => useDesignStore((state) => state.getCartTotal());
export const useCartItemCount = () => useDesignStore((state) => state.getCartItemCount());
export const useUser = () => useDesignStore((state) => state.user);
export const useIsLoading = () => useDesignStore((state) => state.isLoading);
export const useError = () => useDesignStore((state) => state.error);

// Additional useful selectors
export const useCurrentDesign = () => useDesignStore((state) => state.currentDesign);
export const useCurrentView = () => useDesignStore((state) => state.currentView);
export const useSelectedElementId = () => useDesignStore((state) => state.selectedElementId);

export default useDesignStore;