import Link from "next/link";
import { ArrowRight, CheckCircle, Store, Package, BarChart3 } from "lucide-react";

export default function SellPage() {
  const plans = [
    {
      name: "Starter",
      price: "R399/month",
      items: "Up to 10 products",
    },
    {
      name: "Growth",
      price: "R599/month",
      items: "Up to 20 products",
      featured: true,
    },
    {
      name: "Premium",
      price: "R1,199/month",
      items: "Unlimited products",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white/60">
              For Streetwear Brands
            </p>

            <h1 className="text-5xl font-black leading-[0.9] sm:text-7xl">
              Start selling on The Village.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Launch your brand online, list your products, manage orders, and
              reach customers without needing your own website.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sell/register"
                className="inline-flex items-center justify-center bg-white px-7 py-4 text-sm font-black uppercase text-black"
              >
                Apply to Join <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center justify-center border border-white/20 px-7 py-4 text-sm font-black uppercase text-white"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            {
              icon: Store,
              title: "Brand Profile",
              text: "Get your own dedicated space on the marketplace.",
            },
            {
              icon: Package,
              title: "Product Listings",
              text: "Upload apparel, prices, images, sizes, and details.",
            },
            {
              icon: BarChart3,
              title: "Orders & Growth",
              text: "Track orders and build your streetwear presence.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <Icon className="mb-5 h-7 w-7 text-white/70" />
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h2 className="text-4xl font-black">Partnership Packages</h2>
            <p className="mt-3 text-white/60">
              No registration fee. No setup cost. Simple monthly plans.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-6 ${
                  plan.featured
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                {plan.featured && (
                  <p className="mb-4 inline-flex rounded-full bg-black px-3 py-1 text-xs font-black text-white">
                    Recommended
                  </p>
                )}

                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className="mt-3 text-3xl font-black">{plan.price}</p>

                <div className="mt-6 space-y-3 text-sm">
                  {[plan.items, "Brand profile", "Dashboard access", "Order tracking"].map(
                    (item) => (
                      <p key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {item}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-white/50">
            You only need 1–2 sales per month to cover your plan.
          </p>
        </div>
      </section>
    </main>
  );
}