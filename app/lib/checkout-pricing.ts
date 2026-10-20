export type ShippingMethod = "delivery" | "pickup";

export const DELIVERY_FEE_CENTS = 7500;
export const FREE_DELIVERY_THRESHOLD_CENTS = 50000;

export function moneyToCents(value: unknown): number {
  if (typeof value === "number") {
    const cents = Math.round(value * 100);
    // Accept normal floating-point summation noise, but not fractional cents.
    if (!Number.isFinite(value) || !Number.isSafeInteger(cents) || cents <= 0 || Math.abs(value * 100 - cents) > 0.000001) throw new Error("Invalid product price.");
    return cents;
  }
  const normalized = typeof value === "string" ? value.replace(/^R\s*/i, "").replaceAll(",", "").trim() : "";
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error("Invalid product price.");
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("Invalid product price.");
  return cents;
}

export function getShippingFeeCents(subtotal: number, method: ShippingMethod) {
  return method === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD_CENTS ? DELIVERY_FEE_CENTS : 0;
}

export type RequestedItem = { product_id: string; quantity: number; size: string; material: string };
export type CheckoutItem = RequestedItem & {
  brand_id: string; product_name: string; product_image: string;
  unit_price: number; total_price: number; cart_item_id: string;
};
export type CheckoutProduct = {
  id: string; brand_id: string; name: string; price: unknown;
  imageurl?: string; soldOut?: boolean; sold_out?: boolean; stock?: number | null;
  availableSizes?: string[]; availableMaterials?: string[];
  available_sizes?: string[]; available_materials?: string[];
};

export function parseCheckoutItems(value: unknown): RequestedItem[] {
  if (!Array.isArray(value) || !value.length || value.length > 100) throw new Error("Your cart must contain 1–100 items.");
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid cart item.");
    const row = item as Record<string, unknown>;
    if (typeof row.product_id !== "string" || !row.product_id || row.product_id.length > 100 || !Number.isInteger(row.quantity) || Number(row.quantity) < 1 || Number(row.quantity) > 99) throw new Error("Invalid product or quantity.");
    if (typeof row.size !== "string" || !row.size || row.size.length > 40 || typeof row.material !== "string" || !row.material || row.material.length > 100) throw new Error("Choose a size and material before checking out.");
    return { product_id: row.product_id, quantity: Number(row.quantity), size: row.size, material: row.material };
  });
}

export function priceCheckout(items: RequestedItem[], products: CheckoutProduct[], method: ShippingMethod) {
  const quantities = new Map<string, number>();
  const brands = new Set<string>();
  let subtotalCents = 0;
  const cartItems: CheckoutItem[] = items.map(item => {
    const product = products.find(product => product.id === item.product_id);
    if (!product || product.soldOut || product.sold_out) throw new Error("An item in your cart is no longer available.");
    if (!product.brand_id) throw new Error("This product is missing its brand. Please contact support.");
    brands.add(product.brand_id);
    const quantity = (quantities.get(product.id) || 0) + item.quantity;
    quantities.set(product.id, quantity);
    if (quantity > 99 || (typeof product.stock === "number" && quantity > product.stock)) throw new Error(`Not enough stock for ${product.name}.`);
    const sizes = product.availableSizes || product.available_sizes || [];
    const materials = product.availableMaterials || product.available_materials || [];
    if (sizes.length && !sizes.includes(item.size)) throw new Error(`Choose an available size for ${product.name}.`);
    const material = item.material === "Default" && materials.length ? materials[0] : item.material;
    if (materials.length && !materials.includes(material)) throw new Error(`Choose an available material for ${product.name}.`);
    const unitCents = moneyToCents(product.price);
    subtotalCents += unitCents * item.quantity;
    return { ...item, material, brand_id: product.brand_id, product_name: product.name, product_image: product.imageurl || "/noImage.jpg", unit_price: unitCents / 100, total_price: unitCents * item.quantity / 100, cart_item_id: `${product.id}-${item.size}-${item.material}` };
  });
  if (brands.size !== 1) throw new Error("Only one brand can be checked out at a time.");
  const deliveryCents = getShippingFeeCents(subtotalCents, method);
  const totalCents = subtotalCents + deliveryCents;
  if (!Number.isSafeInteger(totalCents) || totalCents > 100000000) throw new Error("The order total is too large.");
  return { cartItems, brandId: [...brands][0], subtotalCents, deliveryCents, totalCents };
}
