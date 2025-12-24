'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Image as ImageIcon, LogIn, LogOut, X, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: string;
  category?: string;
  soldout?: boolean;
  imageurl?: string;
  images?: string[];
  description?: string;
  availablesizes?: string[];
  availablematerials?: string[];
  created_at?: string;
  updated_at?: string;
}

type ImageItem = {
  url: string; // public URL or blob preview
  file?: File;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<ImageItem | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ImageItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    soldout: false,
    description: "",
    sizes: "",
    materials: "",
  });

  // Auth logic (unchanged)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: adminData } = await supabase
          .from("admins")
          .select("id, full_name")
          .eq("id", session.user.id)
          .single();
        
        if (adminData) {
          setIsAdmin(true);
          setAdminProfile(adminData);
        } else {
          setIsAdmin(false);
          setAdminProfile(null);
        }
      } else {
        setIsAdmin(false);
        setAdminProfile(null);
      }
      setAuthLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) toast.error("Login failed: " + error.message);
    else setLoginForm({ email: "", password: "" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("thevillageproducts").select("*");
    if (error) console.error(error);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Main image handler
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setMainImage({ file, url: preview });
    }
  };

  const removeMainImage = () => {
    if (mainImage?.url.startsWith("blob:")) {
      URL.revokeObjectURL(mainImage.url);
    }
    setMainImage(null);
  };

  // Additional images handler
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setAdditionalImages((prev) => [...prev, ...newItems]);
  };

  const removeAdditionalImage = (index: number) => {
    const item = additionalImages[index];
    if (item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup previews
  const cleanupPreviews = () => {
    if (mainImage?.url.startsWith("blob:")) {
      URL.revokeObjectURL(mainImage.url);
    }
    additionalImages.forEach((item) => {
      if (item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    });
  };

  // Generate slug
  const generateSlug = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Upload single image
  const uploadImage = async (file: File, productId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `products/${productId}/${fileName}`;

    const { error } = await supabase.storage
      .from("thevillageProductsBucket")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("thevillageProductsBucket")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Submit product
  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert("Name and price required");

    setLoading(true);

    try {
      const productId = editingProduct?.id || crypto.randomUUID();

      // Determine main URL
      let mainUrl = editingProduct?.imageurl ?? "";
      if (mainImage?.file) {
        mainUrl = await uploadImage(mainImage.file, productId);
      }

      // Existing additional URLs (non-new)
      const existingAdditional = additionalImages
        .filter((img) => !img.file)
        .map((img) => img.url);

      // Upload new additional images
      const newAdditionalFiles = additionalImages.filter((img) => img.file);
      const newAdditionalUrls = newAdditionalFiles.length > 0
        ? await Promise.all(newAdditionalFiles.map((img) => uploadImage(img.file!, productId)))
        : [];

      // Build final arrays
      const finalAdditionalUrls = [...existingAdditional, ...newAdditionalUrls];
      const finalImages = mainUrl ? [mainUrl, ...finalAdditionalUrls] : finalAdditionalUrls;
      const finalMainUrl = finalImages[0] ?? null;

      const sizesArray = form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : null;
      const materialsArray = form.materials ? form.materials.split(',').map(m => m.trim()).filter(Boolean) : null;

      const payload = {
        id: productId,
        slug: generateSlug(form.name),
        name: form.name,
        price: form.price,
        category: form.category || null,
        soldout: form.soldout,
        description: form.description || null,
        imageurl: finalMainUrl,
        images: finalImages.length > 0 ? finalImages : null,
        availablesizes: sizesArray,
        availablematerials: materialsArray,
      };

      if (editingProduct) {
        const { error: updateError } = await supabase
          .from("thevillageproducts")
          .update(payload)
          .eq("id", productId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("thevillageproducts")
          .insert([payload]);
        if (insertError) throw insertError;
      }

      cleanupPreviews();
      resetForm();
      await fetchProducts();
    } catch (error: any) {
      console.error("Error submitting product:", error);
      toast.error("Failed to submit product: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      soldout: false,
      description: "",
      sizes: "",
      materials: "",
    });
    setMainImage(null);
    setAdditionalImages([]);
    setEditingProduct(null);
    setDrawerOpen(false);
  };

  const handleCloseDrawer = () => {
    cleanupPreviews();
    resetForm();
  };

  // Delete product (unchanged)
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("thevillageproducts").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product.");
    } else {
      await fetchProducts();
    }
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category || "",
      soldout: product.soldout ?? false,
      description: product.description || "",
      sizes: product.availablesizes?.join(', ') || "",
      materials: product.availablematerials?.join(', ') || "",
    });

    // Load images – prioritize `images` array, fallback to `imageurl`
    const allImages = product.images ?? (product.imageurl ? [product.imageurl] : []);
    setMainImage(allImages[0] ? { url: allImages[0] } : null);
    setAdditionalImages(allImages.slice(1).map(url => ({ url })));

    setDrawerOpen(true);
  };

  // Add new
  const handleAddNew = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      price: "",
      category: "",
      soldout: false,
      description: "",
      sizes: "",
      materials: "",
    });
    setMainImage(null);
    setAdditionalImages([]);
    setDrawerOpen(true);
  };

  // Auth guards (unchanged)
  if (authLoading) return <div className="flex justify-center items-center h-screen bg-black text-white">Loading...</div>;
  if (!user) {
    // ... login form unchanged
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4 uppercase tracking-widest">ADMIN ACCESS REQUIRED</h1>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
          <Input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            className="mb-4 bg-gray-800 border-gray-600 text-white"
          />
          <Input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="mb-4 bg-gray-800 border-gray-600 text-white"
          />
          <Button onClick={handleLogin} className="w-full bg-white text-black hover:bg-gray-100">
            <LogIn size={18} className="mr-2" /> LOGIN AS ADMIN
          </Button>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    // ... denied unchanged
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4 uppercase tracking-widest">ADMIN ACCESS DENIED</h1>
        <p className="text-gray-400 mb-4">You're logged in as a customer. Contact support to become an admin.</p>
        <Button onClick={handleLogout} variant="outline" className="border-white text-white">
          <LogOut size={18} className="mr-2" /> LOGOUT
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header (unchanged) */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">
            THE VILLAGE
          </h1>
          <p className="text-sm text-gray-400 mt-1">Product Management</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:inline">
            {adminProfile?.full_name || user.email}
          </span>
          <Button
            onClick={handleAddNew}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus size={18} className="mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {/* Product Grid – updated to use images[0] ?? imageurl */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-gray-400 mb-6">Get started by adding your first product</p>
            <Button onClick={handleAddNew} className="bg-white text-black hover:bg-gray-200">
              <Plus size={18} className="mr-2" /> Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImage = product.images?.[0] ?? product.imageurl;
              return (
                <div
                  key={product.id}
                  className="group bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all"
                >
                  <div className="relative aspect-square bg-gray-900">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={48} className="text-gray-700" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                    {product.soldout && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        SOLD OUT
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-xl font-bold mb-2">R{product.price}</p>
                    {product.category && (
                      <p className="text-xs text-gray-400 uppercase mb-2">{product.category}</p>
                    )}
                    {product.availablesizes && product.availablesizes.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Sizes: {product.availablesizes.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer – updated image sections */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg bg-gray-900 border-gray-800 text-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <SheetDescription className="text-gray-400">
              {editingProduct ? "Update product details below" : "Fill in the product details below"}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Form fields (unchanged except image sections removed) */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="49.99"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g., T-Shirts, Hoodies"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Product description..."
                rows={3}
                className="bg-gray-800 border-gray-700 text-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizes">Available Sizes</Label>
              <Input
                id="sizes"
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                placeholder="S, M, L, XL"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materials">Materials</Label>
              <Input
                id="materials"
                name="materials"
                value={form.materials}
                onChange={handleChange}
                placeholder="Cotton, Polyester"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Main Image Section */}
            <div className="space-y-3">
              <Label>Main Image (used in catalog grid) *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-white file:border-0 file:mr-4"
              />
              {mainImage && (
                <div className="relative rounded-lg overflow-hidden border border-gray-700">
                  <img src={mainImage.url} alt="Main preview" className="w-full h-64 object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={removeMainImage}
                  >
                    <X size={16} />
                  </Button>
                  {!mainImage.file && <p className="text-xs text-gray-400 mt-1 text-center">Current main image</p>}
                </div>
              )}
            </div>

            {/* Additional Images Section */}
            <div className="space-y-3">
              <Label>Additional Images (gallery on detail page)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-white file:border-0 file:mr-4"
              />
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {additionalImages.map((item, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-gray-700">
                      <img src={item.url} alt={`Additional ${index + 1}`} className="w-full h-32 object-cover" />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeAdditionalImage(index)}
                      >
                        <X size={14} />
                      </Button>
                      {!item.file && <p className="text-xs text-gray-400 text-center mt-1">Current</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sold Out */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="soldout"
                name="soldout"
                checked={form.soldout}
                onCheckedChange={(checked) => setForm({ ...form, soldout: checked as boolean })}
              />
              <Label htmlFor="soldout" className="text-sm font-normal cursor-pointer">
                Mark as sold out
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCloseDrawer}
                variant="outline"
                className="flex-1 border-gray-700"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !form.name || !form.price}
                className="flex-1 bg-white text-black hover:bg-gray-200"
              >
                {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}