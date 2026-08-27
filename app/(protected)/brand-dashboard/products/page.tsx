"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Image as ImageIcon, X, Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
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
import { productCategories, productMaterials } from "@/app/lib/productOptions";

type Product = {
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
    brand_id?: string;
    brand_name?: string;
    created_by?: string;
};

type ImageItem = {
    url: string;
    file?: File;
};

export default function BrandProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [brandId, setBrandId] = useState("");
    const [brandName, setBrandName] = useState("");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [mainImage, setMainImage] = useState<ImageItem | null>(null);
    const [additionalImages, setAdditionalImages] = useState<ImageItem[]>([]);

    const [form, setForm] = useState({
        name: "",
        price: "",
        category: "",
        soldout: false,
        description: "",
        sizes: "",
        materials: "",
    });

    useEffect(() => {
        checkBrandUser();
    }, []);

    const checkBrandUser = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            window.location.href = "/login";
            return;
        }

        if (user.user_metadata?.role !== "brand") {
            window.location.href = "/protected/profile";
            return;
        }

        const metaBrandId = user.user_metadata?.brand_id;
        const metaBrandName = user.user_metadata?.brand_name;

        if (!metaBrandId || !metaBrandName) {
            toast.error("Brand details missing. Contact admin.");
            return;
        }

        setUserId(user.id);
        setBrandId(metaBrandId);
        setBrandName(metaBrandName);

        await fetchProducts(metaBrandId);
    };

    const fetchProducts = async (currentBrandId: string) => {
        setLoading(true);

        const { data, error } = await supabase
            .from("thevillageproducts")
            .select("*")
            .eq("brand_id", currentBrandId)
            .order("created_at", { ascending: false });

        if (error) {
            toast.error(error.message);
        } else {
            setProducts(data || []);
        }

        setLoading(false);
    };

    const generateSlug = (name: string) =>
        name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const uploadImage = async (file: File, productId: string) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `brands/${brandId}/products/${productId}/${fileName}`;

        const { error } = await supabase.storage
            .from("thevillageProductsBucket")
            .upload(filePath, file, { upsert: true });

        if (error) throw error;

        const {
            data: { publicUrl },
        } = supabase.storage.from("thevillageProductsBucket").getPublicUrl(filePath);

        return publicUrl;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setMainImage({
                file,
                url: URL.createObjectURL(file),
            });
        }
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const items = Array.from(files).map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setAdditionalImages((prev) => [...prev, ...items]);
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

    const handleAddNew = () => {
        resetForm();
        setDrawerOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);

        setForm({
            name: product.name,
            price: product.price,
            category: product.category || "",
            soldout: product.soldout || false,
            description: product.description || "",
            sizes: product.availablesizes?.join(", ") || "",
            materials: product.availablematerials?.join(", ") || "",
        });

        const allImages = product.images ?? (product.imageurl ? [product.imageurl] : []);
        setMainImage(allImages[0] ? { url: allImages[0] } : null);
        setAdditionalImages(allImages.slice(1).map((url) => ({ url })));

        setDrawerOpen(true);
    };

    const handleSubmit = async () => {
        if (
            !form.name.trim() ||
            !form.price.trim() ||
            !form.category ||
            !form.description.trim() ||
            !form.sizes.trim() ||
            !form.materials ||
            !mainImage
        ) {
            toast.error("Please complete all required product fields.");
            return;
        }

        setLoading(true);

        try {
            const productId = editingProduct?.id || crypto.randomUUID();

            let mainUrl = editingProduct?.imageurl || "";

            if (mainImage?.file) {
                mainUrl = await uploadImage(mainImage.file, productId);
            }

            const existingAdditional = additionalImages
                .filter((img) => !img.file)
                .map((img) => img.url);

            const newAdditional = await Promise.all(
                additionalImages
                    .filter((img) => img.file)
                    .map((img) => uploadImage(img.file!, productId))
            );

            const finalImages = mainUrl
                ? [mainUrl, ...existingAdditional, ...newAdditional]
                : [...existingAdditional, ...newAdditional];

            const payload = {
                id: productId,
                slug: generateSlug(form.name),
                name: form.name,
                price: form.price,
                category: form.category || null,
                soldout: form.soldout,
                description: form.description || null,
                imageurl: finalImages[0] || null,
                images: finalImages.length ? finalImages : null,
                availablesizes: form.sizes
                    ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
                    : null,
                availablematerials: form.materials
                    ? form.materials.split(",").map((m) => m.trim()).filter(Boolean)
                    : null,

                // brand ownership
                brand_id: brandId,
                brand_name: brandName,
                created_by: userId,
            };

            if (editingProduct) {
                const { error } = await supabase
                    .from("thevillageproducts")
                    .update(payload)
                    .eq("id", productId)
                    .eq("brand_id", brandId);

                if (error) throw error;

                toast.success("Product updated.");
            } else {
                const { error } = await supabase.from("thevillageproducts").insert(payload);

                if (error) throw error;

                toast.success("Product added.");
            }

            resetForm();
            await fetchProducts(brandId);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;

        const { error } = await supabase
            .from("thevillageproducts")
            .delete()
            .eq("id", id)
            .eq("brand_id", brandId);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Product deleted.");
        await fetchProducts(brandId);
    };

    return (
        <main className="min-h-screen bg-black p-4 text-white md:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link
                        href="/brand-dashboard"
                        className="mb-3 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to dashboard
                    </Link>

                    <h1 className="text-3xl font-black md:text-4xl">{brandName}</h1>
                    <p className="mt-1 text-sm text-white/50">Manage your brand products.</p>
                </div>

                <Button onClick={handleAddNew} className="bg-white text-black hover:bg-white/80">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                {loading ? (
                    <p className="py-12 text-center text-white/50">Loading products...</p>
                ) : products.length === 0 ? (
                    <div className="py-12 text-center">
                        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-white/20" />
                        <h2 className="text-xl font-black">No products yet</h2>
                        <p className="mt-2 text-sm text-white/50">
                            Add your first product to start selling on The Village.
                        </p>
                        <Button
                            onClick={handleAddNew}
                            className="mt-6 bg-white text-black hover:bg-white/80"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => {
                            const primaryImage = product.images?.[0] || product.imageurl;

                            return (
                                <div
                                    key={product.id}
                                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/40"
                                >
                                    <div className="relative aspect-square bg-white/5">
                                        {primaryImage ? (
                                            <img
                                                src={primaryImage}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <ImageIcon className="h-10 w-10 text-white/20" />
                                            </div>
                                        )}

                                        <div className="absolute right-2 top-2 flex gap-2">
                                            <Button
                                                size="icon"
                                                onClick={() => handleEdit(product)}
                                                className="h-8 w-8 bg-white text-black hover:bg-white/80"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => handleDelete(product.id)}
                                                className="h-8 w-8"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {product.soldout && (
                                            <span className="absolute left-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black">
                                                SOLD OUT
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="truncate text-lg font-black">{product.name}</h3>
                                        <p className="mt-1 text-xl font-black">R{product.price}</p>
                                        {product.category && (
                                            <p className="mt-2 text-xs uppercase text-white/40">
                                                {product.category}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent className="inset-y-4 right-4 flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col overflow-hidden rounded-3xl border border-white/10 bg-black p-0 text-white sm:w-[46rem] sm:max-w-none lg:w-[56rem]">
                    <SheetHeader className="border-b border-white/10 px-6 py-5 sm:px-8">
                        <SheetTitle className="text-white">
                            {editingProduct ? "Edit Product" : "Add Product"}
                        </SheetTitle>
                        <SheetDescription className="text-white/50">
                            This product will be listed under {brandName}.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="overflow-y-auto px-6 py-6 sm:px-8">
                        <div className="grid gap-5 lg:grid-cols-2">
                            <Field label="Product Name" name="name" value={form.name} onChange={handleChange} required />
                            <PriceField value={form.price} onChange={handleChange} />
                            <CategoryField value={form.category} onChange={handleChange} />
                            <Field label="Sizes" name="sizes" value={form.sizes} onChange={handleChange} placeholder="S, M, L, XL" required />
                            <MaterialField value={form.materials} onChange={handleChange} />
                        </div>

                        <div className="mt-5">
                            <RequiredLabel>Description</RequiredLabel>
                            <Textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="mt-2 min-h-32 border-white/10 bg-white/5 text-white"
                            />
                        </div>

                        <div className="mt-6 grid gap-5 lg:grid-cols-2">
                            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <div>
                                    <RequiredLabel>Main Image</RequiredLabel>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImageChange}
                                        className="mt-2 border-white/10 bg-white/5 text-white"
                                    />
                                </div>

                                {mainImage ? (
                                    <div className="relative overflow-hidden rounded-xl border border-white/10">
                                        <img src={mainImage.url} className="h-64 w-full object-cover" />
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute right-2 top-2"
                                            onClick={() => setMainImage(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/40 text-sm text-white/35">
                                        Main image preview
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <div>
                                    <Label>Additional Images</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAdditionalImagesChange}
                                        className="mt-2 border-white/10 bg-white/5 text-white"
                                    />
                                </div>

                                {additionalImages.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {additionalImages.map((img, index) => (
                                            <div
                                                key={index}
                                                className="relative overflow-hidden rounded-xl border border-white/10"
                                            >
                                                <img src={img.url} className="h-28 w-full object-cover" />
                                                <button
                                                    onClick={() =>
                                                        setAdditionalImages((prev) =>
                                                            prev.filter((_, i) => i !== index)
                                                        )
                                                    }
                                                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/40 text-sm text-white/35">
                                        Additional image previews
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                            <Checkbox
                                checked={form.soldout}
                                onCheckedChange={(checked) =>
                                    setForm({ ...form, soldout: checked as boolean })
                                }
                            />
                            <Label>Mark as sold out</Label>
                        </div>

                        <div className="sticky bottom-0 -mx-6 mt-6 flex gap-3 border-t border-white/10 bg-black/95 px-6 py-4 sm:-mx-8 sm:px-8">
                            <Button
                                variant="outline"
                                onClick={resetForm}
                                className="flex-1 border-white/15 bg-black text-white hover:bg-white/10 hover:text-white"
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-white font-black text-black hover:bg-white/80"
                            >
                                {loading
                                    ? "Saving..."
                                    : editingProduct
                                        ? "Update Product"
                                        : "Add Product"}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </main>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    placeholder,
    required,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <div>
            {required ? <RequiredLabel>{label}</RequiredLabel> : <Label>{label}</Label>}
            <Input
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="mt-2 border-white/10 bg-white/5 text-white"
            />
        </div>
    );
}

function PriceField({
    value,
    onChange,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <RequiredLabel>Price</RequiredLabel>
            <div className="mt-2 flex overflow-hidden rounded-md border border-white/10 bg-white/5 focus-within:ring-2 focus-within:ring-white/30">
                <span className="flex items-center border-r border-white/10 px-3 text-sm font-black text-white/60">
                    R
                </span>
                <Input
                    name="price"
                    value={value}
                    onChange={onChange}
                    required
                    inputMode="decimal"
                    placeholder="399"
                    className="border-0 bg-transparent text-white focus-visible:ring-0"
                />
            </div>
        </div>
    );
}

function CategoryField({
    value,
    onChange,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
    return (
        <div>
            <RequiredLabel>Category</RequiredLabel>
            <select
                name="category"
                value={value}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-white/30"
            >
                <option value="" className="bg-black">
                    Select category
                </option>
                {productCategories.map((category) => (
                    <option key={category} value={category} className="bg-black">
                        {category}
                    </option>
                ))}
            </select>
        </div>
    );
}

function MaterialField({
    value,
    onChange,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
    return (
        <div>
            <RequiredLabel>Material</RequiredLabel>
            <select
                name="materials"
                value={value}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-white/30"
            >
                <option value="" className="bg-black">
                    Select material
                </option>
                {productMaterials.map((material) => (
                    <option key={material} value={material} className="bg-black">
                        {material}
                    </option>
                ))}
            </select>
        </div>
    );
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
    return (
        <Label>
            {children} <span className="text-red-400">*</span>
        </Label>
    );
}
