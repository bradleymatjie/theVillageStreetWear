export interface CollaborationItem {
  slug: string;
  name: string;
  price: string;
  soldOut: boolean;
  imageUrl: string;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    price: string;
    category?: string;
    soldOut?: boolean;
    imageurl: string;
    images: string[];
    description?: string;
    availableSizes: string[];
    availableMaterials: string[];
}

export interface ProductInput {
  slug: string;
  name: string;
  price: number;
  category: string;
  sold_out?: boolean;
  image_url?: string;
  description?: string;
  available_sizes?: string[];
  available_materials?: string[];
  stock?: number;
}