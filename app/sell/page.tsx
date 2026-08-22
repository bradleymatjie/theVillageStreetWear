import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Handshake,
  Package,
  Percent,
  Receipt,
  Store,
} from "lucide-react";

export default function SellPage() {
  const benefits = [
    {
      icon: Store,
      title: "Brand Profile",
      text: "A dedicated storefront signal with your brand name shown across the shopping experience.",
    },
    {
      icon: Package,
      title: "Product Listings",
      text: "Upload apparel, prices, images, sizes, materials, and stock details in one place.",
    },
    {
      icon: BarChart3,
      title: "Orders & Growth",
      text: "See paid orders, completed sales, and product activity from your brand dashboard.",
    },
  ];

  const commissionHighlights = [
    {
      icon: Percent,
      title: "Commission Only",
      text: "No monthly subscription. The Village earns only when your brand makes a sale.",
    },
    {
      icon: Receipt,
      title: "Clear Payouts",
      text: "Orders, fees, and expected payouts stay visible from your brand dashboard.",
    },
    {
      icon: Handshake,
      title: "Aligned Growth",
      text: "We focus on helping brands sell more because the partnership grows with sales.",
    },
  ];

  const onboardingSteps = [
    {
      step: "01",
      title: "Apply",
      text: "Tell us about your brand, products, and current online presence.",
    },
    {
      step: "02",
      title: "Agree Terms",
      text: "We align on commission, payout process, delivery workflow, and launch requirements.",
    },
    {
      step: "03",
      title: "Start Selling",
      text: "Upload products, receive orders, and track performance from your dashboard.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white/60">
              For Streetwear Brands
            </p>

            <h1 className="text-5xl font-black leading-[0.9] sm:text-7xl">
              Start selling on The Village.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Launch your brand online, list your products, manage orders, and
              reach customers without paying a monthly subscription.
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
                View Commission
              </Link>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-5">
            <div className="border border-white/10 bg-black p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                Brand dashboard preview
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  ["Products live", "24"],
                  ["Paid orders", "18"],
                  ["Commission model", "Active"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <span className="text-sm text-white/55">{label}</span>
                    <span className="text-sm font-black text-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 border border-white/10 bg-white p-4 text-black">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/45">
                  Customer view
                </p>
                <p className="mt-3 text-2xl font-black">Your Brand</p>
                <p className="mt-2 text-sm text-black/55">
                  Products, checkout, and order tracking presented in one
                  marketplace flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="border border-white/10 bg-white/5 p-6"
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
            <h2 className="text-4xl font-black">Commission Partnership</h2>
            <p className="mt-3 text-white/60">
              No registration fee. No setup cost. No monthly plan.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border border-white bg-white p-6 text-black sm:p-8">
              <p className="mb-4 inline-flex bg-black px-3 py-1 text-xs font-black uppercase text-white">
                Pay when you sell
              </p>
              <h3 className="max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
                Your brand joins free. The Village takes a commission from
                completed sales.
              </h3>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-black/60 sm:text-base">
                Instead of charging brands upfront, we earn a percentage only
                after a customer places and pays for an order.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Free application",
                  "Free brand profile",
                  "Dashboard access",
                  "Order tracking",
                  "Product listings",
                  "Sales support",
                ].map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle className="h-4 w-4" />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {commissionHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="border border-white/10 bg-white/5 p-6"
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
          </div>

          <div id="onboarding" className="mt-12 grid gap-4 md:grid-cols-3">
            {onboardingSteps.map((item) => (
              <div
                key={item.step}
                className="border border-white/10 bg-white/5 p-6"
              >
                <p className="text-sm font-black text-white/30">{item.step}</p>
                <h3 className="mt-4 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                  Built for conversion
                </p>
                <h3 className="mt-3 text-3xl font-black">
                  Customers see a cleaner buying journey.
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/60">
                  Brand names appear on product cards, products can be searched
                  by brand or category, and checkout stays consistent across the
                  marketplace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Brand visibility",
                  "Faster product discovery",
                  "Consistent checkout",
                ].map((item) => (
                  <div key={item} className="border border-white/10 bg-black p-4">
                    <CheckCircle className="mb-4 h-5 w-5 text-white/70" />
                    <p className="text-sm font-black">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/50">
            Commission applies only to completed marketplace sales. No fee is
            charged for applying.
          </p>
        </div>
      </section>
    </main>
  );
}
