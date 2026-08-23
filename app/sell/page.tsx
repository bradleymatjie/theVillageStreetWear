import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/app/lib/types";
import { getBrandPath, slugifyBrandName } from "@/app/lib/brandSlug";

export const dynamic = "force-dynamic";

type Brand = {
  id: string;
  name: string;
  status?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  location_city?: string | null;
  location_province?: string | null;
  location_country?: string | null;
  tagline?: string | null;
  story?: string | null;
  style_category?: string | null;
};

type BrandSummary = Brand & {
  productCount: number;
};

const valueIndicators = [
  ["R0", "Monthly fees"],
  ["R0", "Listing fees"],
  ["10%", "Commission on completed sales"],
];

const sellerTools = [
  {
    icon: Store,
    title: "Brand Profile",
    text: "A dedicated storefront for your brand inside The Village.",
  },
  {
    icon: Package,
    title: "Product Listings",
    text: "Upload apparel, images, prices, sizes, variants and stock.",
  },
  {
    icon: BarChart3,
    title: "Orders & Growth",
    text: "Manage orders, monitor sales and understand product activity.",
  },
];

const marketplaceTools = [
  "Dedicated Village storefront",
  "Product listings",
  "Customer discovery",
  "Customer checkout",
  "Payment infrastructure",
  "Seller dashboard",
  "Order management",
  "Delivery infrastructure",
  "Tracking",
  "Sales reporting",
  "Marketplace support",
];

const journeySteps = [
  ["01", "Apply", "Tell us about your brand, products and current presence."],
  ["02", "Get approved", "Every application is reviewed to keep The Village curated."],
  ["03", "Build your storefront", "Complete your profile and upload your products."],
  ["04", "Start selling", "Receive orders, fulfil them and grow through The Village."],
];

const customerBenefits = [
  ["Brand visibility", "Customers can discover independent brands they may not already follow."],
  ["Product discovery", "Customers can explore products from multiple South African labels in one marketplace."],
  ["Consistent checkout", "Customers get a familiar Village checkout experience across brands."],
  ["Order tracking", "Marketplace delivery infrastructure gives visibility after purchase."],
];

function getLocation(brand: Brand) {
  return [brand.location_city, brand.location_province, brand.location_country]
    .filter(Boolean)
    .join(", ");
}

function getProductCount(products: Product[], brand: Brand) {
  return products.filter(
    (product) =>
      product.brand_id === brand.id ||
      slugifyBrandName(product.brand_name || "") === slugifyBrandName(brand.name)
  ).length;
}

async function getRecruitmentData() {
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("*").eq("status", "active"),
    supabase
      .from("thevillageproducts")
      .select("id, slug, name, price, category, imageurl, images, brand_id, brand_name")
      .order("created_at", { ascending: false }),
  ]);

  const productList = (products || []) as Product[];
  const brandMap = new Map<string, BrandSummary>();

  ((brands || []) as Brand[])
    .map((brand) => ({
      ...brand,
      productCount: getProductCount(productList, brand),
    }))
    .filter((brand) => brand.name)
    .filter((brand) => brand.productCount > 0)
    .forEach((brand) => {
      const key = slugifyBrandName(brand.name) || brand.id;
      const existing = brandMap.get(key);

      if (!existing || brand.productCount > existing.productCount) {
        brandMap.set(key, brand);
      }
    });

  const brandList = [...brandMap.values()].sort(
    (a, b) => b.productCount - a.productCount
  );

  return {
    brands: brandList,
    products: productList,
  };
}

function MetricStrip() {
  return (
    <div className="grid border-y border-white/10 md:grid-cols-3">
      {valueIndicators.map(([value, label]) => (
        <div key={label} className="border-white/10 p-6 md:border-r last:md:border-r-0">
          <p className="text-5xl font-black leading-none text-white">{value}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-white/45">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-white/35">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-black leading-none sm:text-5xl">
        {title}
      </h2>
      {text && <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">{text}</p>}
    </div>
  );
}

function Flow({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={item} className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-xs font-black text-white/55">
            {String(index + 1).padStart(2, "0")}
          </div>
          <p className="border border-white/10 bg-black px-4 py-3 text-sm font-black uppercase tracking-wide text-white/75">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

export default async function SellPage() {
  const { brands, products } = await getRecruitmentData();
  const showcaseBrand =
    brands.find((brand) => slugifyBrandName(brand.name) === "slowbucks") ||
    brands[0];
  const showcaseProducts = showcaseBrand
    ? products
        .filter(
          (product) =>
            product.brand_id === showcaseBrand.id ||
            slugifyBrandName(product.brand_name || "") ===
              slugifyBrandName(showcaseBrand.name)
        )
        .slice(0, 4)
    : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-white/55">
              For South African Streetwear Brands
            </p>
            <h1 className="max-w-4xl text-6xl font-black leading-[0.88] sm:text-8xl">
              YOUR BRAND BELONGS IN THE VILLAGE.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Bring your brand to South Africa&apos;s streetwear marketplace.
              Reach new customers, sell your products and manage your storefront
              with no monthly subscription.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sell/register"
                className="inline-flex items-center justify-center bg-white px-7 py-4 text-sm font-black uppercase text-black transition hover:bg-white/85"
              >
                Apply to The Village <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center justify-center border border-white/20 px-7 py-4 text-sm font-black uppercase text-white transition hover:bg-white hover:text-black"
              >
                Explore brands
              </Link>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
              Applications are reviewed before approval.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-5">
            <div className="border border-white/10 bg-black p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                Partnership model
              </p>
              <div className="mt-6 grid gap-3">
                {valueIndicators.map(([value, label]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-4 py-4"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                      {label}
                    </span>
                    <span className="text-3xl font-black">{value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 border border-white/10 bg-white p-4 text-sm font-black uppercase tracking-wide text-black">
                We only earn when you sell.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MetricStrip />

      <section id="brands" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Already in The Village"
            title="Real brands. Real products."
            text="See the labels already building storefronts and selling through The Village."
          />

          {brands.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.04] p-8">
              <p className="font-black">Active brands will appear here.</p>
              <p className="mt-2 text-sm text-white/50">
                Once brands are approved, this section will become live social proof.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {brands.slice(0, 4).map((brand) => (
                  <Link
                    key={brand.id}
                    href={getBrandPath({ id: brand.id, name: brand.name })}
                    className="group border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-white/40"
                  >
                    <div className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden border border-white/10 bg-black">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={`${brand.name} logo`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-black text-white/45">
                          {brand.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-black">{brand.name}</p>
                    <p className="mt-2 text-sm text-white/50">
                      {brand.productCount} products live
                    </p>
                    {getLocation(brand) && (
                      <p className="mt-3 flex items-center gap-2 text-xs text-white/40">
                        <MapPin className="h-3.5 w-3.5" />
                        {getLocation(brand)}
                      </p>
                    )}
                    <p className="mt-5 inline-flex items-center text-xs font-black uppercase tracking-wide text-white/50 group-hover:text-white">
                      View storefront <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </p>
                  </Link>
                ))}
              </div>
              <Link
                href="/brands"
                className="mt-6 inline-flex items-center border border-white/20 px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-white hover:text-black"
              >
                Explore all brands <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </section>

      {showcaseBrand && (
        <section className="border-y border-white/10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Your brand. Your space."
              title="A storefront built around your identity."
              text="Every approved brand gets its own dedicated storefront inside The Village, built around its story and products."
            />

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="border border-white/10 bg-white/[0.04]">
                <div className="relative h-56 overflow-hidden bg-white/5">
                  {showcaseBrand.cover_image_url ? (
                    <img
                      src={showcaseBrand.cover_image_url}
                      alt={`${showcaseBrand.name} storefront cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-8xl font-black text-white/10">
                      {showcaseBrand.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                      {showcaseBrand.style_category || "Brand identity"}
                    </p>
                    <h3 className="mt-2 text-4xl font-black">{showcaseBrand.name}</h3>
                  </div>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-[0.7fr_1.3fr]">
                  <div className="border border-white/10 bg-black p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                      Brand details
                    </p>
                    <p className="mt-4 text-sm text-white/65">
                      {getLocation(showcaseBrand) || "South Africa"}
                    </p>
                    <p className="mt-3 text-sm text-white/65">
                      {showcaseBrand.productCount} products live
                    </p>
                  </div>
                  <div className="border border-white/10 bg-black p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                      About {showcaseBrand.name}
                    </p>
                    <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/60">
                      {showcaseBrand.story ||
                        showcaseBrand.tagline ||
                        "Your brand story gives customers a reason to remember you beyond a product grid."}
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 p-5">
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white/35">
                    Latest drops
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {showcaseProducts.length > 0 ? (
                      showcaseProducts.map((product) => (
                        <div key={product.id} className="flex gap-3 border border-white/10 bg-black p-3">
                          <img
                            src={product.imageurl || "/noImage.jpg"}
                            alt={product.name}
                            className="h-20 w-16 shrink-0 object-cover"
                          />
                          <div>
                            <p className="line-clamp-2 text-sm font-black">{product.name}</p>
                            <p className="mt-2 text-xs uppercase tracking-wide text-white/40">
                              {product.category || "Streetwear"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/50">Products will appear here.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  ["Your identity", "Your brand remains front and centre."],
                  ["Your story", "Tell customers what your brand represents."],
                  ["Your collection", "Your products live together in one dedicated storefront."],
                  ["Your link", `thevillagestreetwear.com${getBrandPath({ id: showcaseBrand.id, name: showcaseBrand.name })}`],
                ].map(([title, text]) => (
                  <div key={title} className="border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="text-xl font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
                  </div>
                ))}
                <Link
                  href={getBrandPath({ id: showcaseBrand.id, name: showcaseBrand.name })}
                  className="inline-flex items-center justify-center bg-white px-6 py-4 text-sm font-black uppercase text-black transition hover:bg-white/85"
                >
                  View storefront <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Seller tools"
            title="Show the experience first. Then run the business."
            text="The dashboard gives approved brands the core tools needed to list, sell and manage orders."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {sellerTools.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border border-white/10 bg-white/5 p-6">
                  <Icon className="mb-5 h-7 w-7 text-white/70" />
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-white/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Commission partnership"
            title="No monthly subscription."
            text="Joining The Village is free. There are no monthly subscription fees and no product listing fees. The Village earns a 10% commission when your brand completes a sale."
          />
          <MetricStrip />
          <div className="mt-6 border border-white bg-white p-6 text-black sm:p-8">
            <p className="text-3xl font-black">We only earn when you sell.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeader
              eyebrow="How 10% works"
              title="A simple example."
              text="Delivery charges remain separate from product revenue."
            />
          </div>
          <div className="border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            {[
              ["Product sale", "R1,000"],
              ["The Village - 10%", "-R100"],
              ["Brand earnings", "R900*"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`flex items-center justify-between py-5 ${
                  index < 2 ? "border-b border-white/10" : ""
                }`}
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-white/45">
                  {label}
                </p>
                <p className="text-3xl font-black">{value}</p>
              </div>
            ))}
            <p className="mt-5 text-xs leading-6 text-white/45">
              *On a R1,000 product sale, The Village earns R100 and the brand
              earns R900 before any separately applicable payment-processing,
              refund or other agreed transaction adjustments.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="One commission. A complete marketplace."
            title="What the 10% supports."
            text="The commission supports the marketplace infrastructure that helps customers discover, buy from and track orders from local brands."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {marketplaceTools.map((item) => (
              <p key={item} className="flex items-center gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-white/70">
                <CheckCircle className="h-4 w-4 shrink-0 text-white" />
                {item}
              </p>
            ))}
          </div>
          <p className="mt-6 text-2xl font-black">The Village succeeds when your brand succeeds.</p>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <div className="border border-white/10 bg-white/[0.04] p-6">
            <Boxes className="mb-5 h-7 w-7 text-white/70" />
            <h2 className="text-3xl font-black">You keep your stock.</h2>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Your inventory stays with you. There&apos;s no need to send
              products to The Village before making a sale.
            </p>
            <div className="mt-6">
              <Flow items={["Your brand", "Keeps inventory", "Receives Village order", "Prepares products"]} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-6">
            <ShoppingBag className="mb-5 h-7 w-7 text-white/70" />
            <h2 className="text-3xl font-black">Your product. Your packaging.</h2>
            <p className="mt-4 text-sm leading-6 text-white/60">
              You package every order, allowing customers to continue
              experiencing your brand from purchase to unboxing.
            </p>
            <div className="mt-6 grid gap-2 text-sm text-white/60">
              {["Branded mailers", "Boxes", "Tissue paper", "Stickers", "Thank-you cards"].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-6">
            <Truck className="mb-5 h-7 w-7 text-white/70" />
            <h2 className="text-3xl font-black">You package it. We coordinate delivery.</h2>
            <p className="mt-4 text-sm leading-6 text-white/60">
              The seller should not need to manually organise every courier
              shipment outside The Village.
            </p>
            <div className="mt-6">
              <Flow items={["Customer orders", "Brand prepares", "Ready for collection", "Village coordinates", "Customer tracks"]} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeader
              eyebrow="Sell. Deliver. Get paid."
              title="From sale to payout."
              text="Brands fulfil orders first. Earnings become available after successful fulfilment and the applicable settlement period."
            />
            <Flow
              items={[
                "Customer pays",
                "Order confirmed",
                "Brand fulfils",
                "Courier delivers",
                "Delivery confirmed",
                "Settlement",
                "Funds available",
                "Brand payout",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Built for serious brands"
            title="Curated, not closed."
            text="Every application is reviewed before a brand joins The Village. This helps us maintain a marketplace customers can trust and brands are proud to be part of."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Original brand identity",
              "Product quality",
              "Product presentation",
              "Reliable stock management",
              "Professional packaging",
              "Reliable fulfilment",
              "Active online presence",
              "Alignment with The Village",
            ].map((item) => (
              <p key={item} className="flex items-center gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-white/70">
                <ShieldCheck className="h-4 w-4 shrink-0 text-white" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section id="onboarding" className="border-y border-white/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="How to join"
            title="Apply. Get approved. Build your storefront. Start selling."
          />
          <div className="grid gap-4 md:grid-cols-4">
            {journeySteps.map(([step, title, text]) => (
              <div key={step} className="border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black text-white/30">{step}</p>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Customer experience"
            title="Customers see a cleaner buying journey."
            text="The stronger the marketplace experience is for customers, the more valuable it becomes for every brand inside it."
          />
          <div className="grid gap-4 md:grid-cols-4">
            {customerBenefits.map(([title, text]) => (
              <div key={title} className="border border-white/10 bg-white/[0.04] p-5">
                <CreditCard className="mb-5 h-6 w-6 text-white/60" />
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border border-white bg-white p-8 text-black sm:p-12">
          <Image
            src="/brand/logo-horizontal-light.png"
            alt="The Village"
            width={518}
            height={157}
            className="mb-8 h-auto w-64"
          />
          <h2 className="max-w-4xl text-5xl font-black leading-none sm:text-7xl">
            YOUR BRAND BELONGS IN THE VILLAGE.
          </h2>
          <p className="mt-5 text-base font-bold text-black/60">
            Join a curated marketplace built around South African streetwear.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/sell/register"
              className="inline-flex items-center justify-center bg-black px-7 py-4 text-sm font-black uppercase text-white transition hover:bg-black/80"
            >
              Apply to The Village <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <p className="text-sm font-black uppercase tracking-wide text-black/60">
              R0 monthly fees. R0 listing fees. 10% commission on completed sales.
            </p>
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-black/40">
            Applications are reviewed before approval.
          </p>
        </div>
      </section>
    </main>
  );
}
