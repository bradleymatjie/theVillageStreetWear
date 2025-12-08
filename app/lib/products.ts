import { Product } from "./types";

// --- UPDATED Product INTERFACE (Must match the one in your client component) ---
// Note: Ensure this 'types.ts' file contains the full interface definition.
// I'm including the full definition here for context:
/* export interface Product {
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
*/
// -----------------------------------------------------------------------------

// Define common options for easier maintenance
const defaultTeeSizes = ['XS', 'S', 'M', 'L', 'XL'];
const defaultHoodieSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const defaultMaterials = ['100% Cotton'];


export const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'custom-tee',
    name: 'CUSTOM TEE',
    price: 'R427.42',
    category: 'T-SHIRTS',
    soldOut: false,
    imageUrl: '/Bradley-Saint.png', // Local image from screenshot
    description: 'Bold printwaves design with unapologetic attitude featuring sheep motif.',
    // --- ADDED PROPERTIES ---
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '2',
    slug: 'designer-long-sleeve',
    name: 'DESIGNER LONG SLEEVE',
    price: 'R598.46',
    category: 'LONG SLEEVE',
    soldOut: false,
    imageUrl: 'https://velocityrecords.com/cdn/shop/products/shirt_front_1080x.jpg?v=1621977506',
    description: 'Premium black long sleeve with graphic cuffs for everyday edge.',
    // --- ADDED PROPERTIES ---
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '3',
    slug: 'premium-print-tee',
    name: 'PREMIUM PRINT TEE',
    price: 'R512.94',
    category: 'T-SHIRTS',
    soldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1613480838954-10d9f4de0128?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'No Baker No Bakers collab tee with subtle, elegant typography.',
    // --- ADDED PROPERTIES ---
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '4',
    slug: 'classic-hoodie',
    name: 'CLASSIC HOODIE',
    price: 'R855.01',
    category: 'HOODIES',
    soldOut: false,
    imageUrl: 'https://printify.com/wp-content/uploads/2023/03/Choose-the-Right-Printing-Method-Direct-to-Garment.png',
    description: 'Vibrant printed hoodie for bold, street-ready statements.',
    // --- ADDED PROPERTIES ---
    availableSizes: defaultHoodieSizes, 
    availableMaterials: defaultMaterials,
  },

  // Best Sellers
  {
    id: '5',
    slug: 'classic-print',
    name: 'CLASSIC PRINT',
    price: 'R427.63',
    category: 'T-SHIRTS',
    soldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0',
    description: 'Timeless classic print tee, essential wardrobe staple.',
    // --- ADDED PROPERTIES ---
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '6',
    slug: 'hoodie',
    name: 'HOODIE',
    price: 'R855.43',
    category: 'HOODIES',
    soldOut: false,
    imageUrl: 'https://thefoschini.vtexassets.com/arquivos/ids/195064413-1200-1600?v=638849532966270000&width=1200&height=1600&aspect=true',
    description: 'Cozy, oversized hoodie perfect for layering.',
    // --- ADDED PROPERTIES ---
    availableSizes: defaultHoodieSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '7',
    slug: 'graphic-tee',
    name: 'GRAPHIC TEE',
    price: 'R478.96',
    category: 'T-SHIRTS',
    soldOut: false,
    imageUrl: '/leo.png',
    description: 'Eye-catching graphic tee with urban vibes.',
    // --- ADDED PROPERTIES ---
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '8',
    slug: 'premium-tee',
    name: 'PREMIUM TEE',
    price: 'R564.52',
    category: 'T-SHIRTS',
    soldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0',
    description: 'High-quality premium cotton tee for all-day comfort.',
    // --- ADDED PROPERTIES ---
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '9',
    slug: 'custom-print',
    name: 'CUSTOM PRINT',
    price: 'R461.85',
    category: 'T-SHIRTS',
    soldOut: false,
    imageUrl: 'https://thefoschini.vtexassets.com/arquivos/ids/222672873-1200-1600?v=639002206448400000&width=1200&height=1600&aspect=true',
    description: 'Personalized custom print tee with your style.',
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '11',
    slug: 'streetwear',
    name: 'STREETWEAR',
    price: 'R598.75',
    category: 'T-SHIRTS',
    soldOut: false,
    imageUrl: 'https://thefoschini.vtexassets.com/arquivos/ids/209238247-1200-1600?v=638890026797130000&width=1200&height=1600&aspect=true',
    description: 'Streetwear-inspired tee with bold graphics.',
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '12',
    slug: 'long-sleeve',
    name: 'LONG SLEEVE',
    price: 'R684.31',
    category: 'LONG SLEEVE',
    soldOut: false,
    imageUrl: 'https://thefoschini.vtexassets.com/arquivos/ids/221001971-300-400/ecebc2c9-690f-4ad7-957f-613047c83c88.png?v=638955972339230000',
    description: 'Versatile long sleeve for transitional weather.',
    availableSizes: defaultTeeSizes, 
    availableMaterials: defaultMaterials,
  },
  {
    id: '14',
    slug: 'minimal-tee',
    name: 'MINIMAL TEE',
    price: 'R299.00',
    category: 'T-SHIRTS',
    soldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0',
    description: 'Clean, minimal tee for understated style.',
    availableSizes: defaultTeeSizes, 
    availableMaterials:defaultMaterials,
  },
];

export const getProductsByCategory = (category: string = 'ALL'): Product[] => {
  if (category === 'ALL') return mockProducts;
  return mockProducts.filter((p) => p.category === category);
};

export const getProductById = (id: string): Product | undefined => {
    return mockProducts.find((p) => p.id === id);
}

export default mockProducts;