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
    imageUrl: string;
    description?: string;
    availableSizes: string[];
    availableMaterials: string[];
}