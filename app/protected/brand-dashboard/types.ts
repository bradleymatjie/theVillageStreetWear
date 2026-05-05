export type OrderItem = {
  size: string;
  brand_id: string;
  material: string;
  quantity: number;
  product_id: string;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_image: string;
};

export type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  email: string;
  phone: string | null;
  amount: number | null;
  shipping_cost: number | null;
  total: number | null;
  status: string;
  payment_status: string | null;
  order_status: string | null;
  shipping_method: "delivery" | "pickup";
  shipping_address: string | null;
  pickup_location: string | null;
  created_at: string;
  brand_id: string | null;
  metadata: {
    cartItems?: OrderItem[];
  } | null;
};