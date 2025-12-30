import { create } from 'zustand';
import { ExtendedUser } from './user';

// Types
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
  id: string;
  name: string;
  elements: {
    front: Element[];
    back: Element[];
  };
  tshirtColor: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  front: string; // base64 JPEG thumbnail
  back: string; // base64 JPEG thumbnail
  elements: {
    front: Element[];
    back: Element[];
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

interface DesignStoreState {
  // Persisted in Supabase
  savedDesigns: SavedDesign[];
  cart: CartItem[];

  // Actions for saved designs
  loadSavedDesigns: (userId:string) => Promise<void>;
  addDesign: (design: { name: string; elements: SavedDesign['elements']; tshirtColor: string },userId:string) => Promise<SavedDesign>;
  removeDesign: (designId: string,userId:string) => Promise<void>;

  // Actions for cart
  loadCart: (user:ExtendedUser) => Promise<void>;
  addToCart: (item: { name: string; front: string; back: string; elements: CartItem['elements']; tshirtColor: string; price?: number },user:ExtendedUser) => Promise<void>;
  updateCartItemQuantity: (itemId:string,userId:string, quantity:number) => Promise<void>;
  removeFromCart: (itemId: string, userId:string) => Promise<void>;
  clearCart: () => Promise<void>;

  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Current working design (local only)
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

  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useDesignStore = create<DesignStoreState>((set, get) => ({
  // Initial state
  savedDesigns: [],
  cart: [],
  user: null,
  isLoading: false,
  error: null,

  currentDesign: {
    elements: { front: [], back: [] },
    tshirtColor: 'white',
  },
  currentView: 'front',
  selectedElementId: null,

  // Local current design actions (unchanged)
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

  // Supabase actions
  loadSavedDesigns: async (userId:string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/saved-designs?userId=${userId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load saved designs');
      }
      const data = await res.json();
      const mapped = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        elements: d.elements,
        tshirtColor: d.tshirt_color,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
      set({ savedDesigns: mapped });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addDesign: async (design, userId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/saved-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: design.name,
          elements: design.elements,
          tshirt_color: design.tshirtColor,
          userId
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save design');
      }
      const newDesign = await res.json();
      const mapped = {
        id: newDesign.id,
        name: newDesign.name,
        elements: newDesign.elements,
        tshirtColor: newDesign.tshirt_color,
        createdAt: newDesign.created_at,
        updatedAt: newDesign.updated_at,
      };
      set((state) => ({ savedDesigns: [...state.savedDesigns, mapped] }));
      return mapped;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  removeDesign: async (designId:string, userId:string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/saved-designs?designId=${designId}&userId=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete design');
      set((state) => ({
        savedDesigns: state.savedDesigns.filter((d) => d.id !== designId),
      }));
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadCart: async (user:ExtendedUser) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/cart-items?userId=${user.id}`, {
        method: 'GET'
      });
      debugger;
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load cart');
      }
      const data = await res.json();
      const mapped = data.map((i: any) => ({
        id: i.id,
        name: i.design_name,
        front: i.front_preview,
        back: i.back_preview,
        elements: i.elements,
        tshirtColor: i.tshirt_color,
        price: i.price,
        quantity: i.quantity,
        addedAt: i.added_at,
      }));
      set({ cart: mapped });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (item,user) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/cart-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design_name: item.name,
          front_preview: item.front,
          back_preview: item.back,
          elements: item.elements,
          tshirt_color: item.tshirtColor,
          price: item.price ?? 250,
          user
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add to cart');
      }
      const returned = await res.json();
      const mapped = {
        id: returned.id,
        name: returned.design_name,
        front: returned.front_preview,
        back: returned.back_preview,
        elements: returned.elements,
        tshirtColor: returned.tshirt_color,
        price: returned.price,
        quantity: returned.quantity,
        addedAt: returned.added_at,
      };
      set((state) => {
        const index = state.cart.findIndex((c) => c.id === mapped.id);
        if (index > -1) {
          const newCart = [...state.cart];
          newCart[index] = mapped;
          return { cart: newCart };
        }
        return { cart: [...state.cart, mapped] };
      });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateCartItemQuantity: async (itemId:string,userId:string, quantity:number) => {
    if (quantity <= 0) {
      await get().removeFromCart(itemId, userId);
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/cart-items?itemId${itemId}&userId=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      const updated = await res.json();
      const mapped = {
        id: updated.id,
        name: updated.design_name,
        front: updated.front_preview,
        back: updated.back_preview,
        elements: updated.elements,
        tshirtColor: updated.tshirt_color,
        price: updated.price,
        quantity: updated.quantity,
        addedAt: updated.added_at,
      };
      set((state) => ({
        cart: state.cart.map((c) => (c.id === itemId ? mapped : c)),
      }));
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (itemId:string, userId:string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/cart-items?itemId=${itemId}&userId=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
      set((state) => ({
        cart: state.cart.filter((c) => c.id !== itemId),
      }));
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      const currentCart = get().cart;
      await Promise.all(
        currentCart.map((item) => fetch(`/api/cart-items/${item.id}`, { method: 'DELETE' }))
      );
      set({ cart: [] });
    } catch {
      // Best effort
    } finally {
      set({ isLoading: false });
    }
  },

  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getCartItemCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },

  setError: (error) => set({ error }),
}));

// Selectors
export const useSavedDesigns = () => useDesignStore((state) => state.savedDesigns);
export const useCartItems = () => useDesignStore((state) => state.cart);
export const useCartTotal = () => useDesignStore((state) => state.getCartTotal());
export const useCartItemCount = () => useDesignStore((state) => state.getCartItemCount());
export const useStoreLoading = () => useDesignStore((state) => state.isLoading);
export const useStoreError = () => useDesignStore((state) => state.error);

export const useCurrentDesign = () => useDesignStore((state) => state.currentDesign);
export const useCurrentView = () => useDesignStore((state) => state.currentView);
export const useSelectedElementId = () => useDesignStore((state) => state.selectedElementId);

export default useDesignStore;