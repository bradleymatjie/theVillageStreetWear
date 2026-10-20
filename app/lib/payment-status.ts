export function paymentState(value?: string | null) {
  const status = value?.toLowerCase();
  return status === "paid" ? "paid" : ["failed", "cancelled", "canceled"].includes(status || "") ? "failed" : "pending";
}

export function purchasedCartItems(value: unknown): { cart_item_id: string; quantity: number }[] {
  let items = value;
  if (typeof items === "string") {
    try { items = JSON.parse(items); } catch { return []; }
  }
  if (!Array.isArray(items)) return [];
  return items.flatMap((item: unknown) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const quantity = Number(row.quantity);
    const id = row.cart_item_id || (row.product_id && row.size && row.material ? `${row.product_id}-${row.size}-${row.material}` : row.id && row.selectedSize && row.selectedMaterial ? `${row.id}-${row.selectedSize}-${row.selectedMaterial}` : "");
    return typeof id === "string" && id && Number.isInteger(quantity) && quantity > 0 ? [{ cart_item_id: id, quantity }] : [];
  });
}
