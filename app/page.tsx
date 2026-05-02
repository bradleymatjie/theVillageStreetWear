import Link from 'next/link';
import Catalog from './components/catalog/page';
import { Suspense } from 'react';
import CatalogLoading from './components/catalog/loading';
import NewsletterSignup from './components/mailList/mailList';
export const dynamic = 'force-dynamic';

export default function Page() {

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100dvh-72px)] overflow-hidden bg-black px-4 py-10 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/joziHome.jpg')" }}
        />
        {/* <div className="absolute inset-0 bg-black/75" /> */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50 lg:bg-gradient-to-r lg:from-black lg:via-black/80 lg:to-black/40" /> */}

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex border border-white/20 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 backdrop-blur sm:text-xs">
              Now onboarding early brands
            </p>

            <h1 className="text-4xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
              A Marketplace for
              <br />
              Streetwear Brands.
            </h1>

            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/80 sm:text-lg lg:text-xl">
              Discover unique streetwear or start selling your brand to a growing audience.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:flex sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-white px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-white/80"
              >
                Explore Catalog
              </Link>

              <Link
                href="/sell"
                className="inline-flex items-center justify-center border border-white/30 bg-black/20 px-7 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
              >
                Join as a Brand
              </Link>
            </div>

            {/* Mobile cards */}
            <div className="mt-10 grid grid-cols-2 gap-3 lg:hidden">
              {[
                ["Marketplace", "The Village", "Local brands selling online."],
                ["For Brands", "Start Selling", "Upload apparel and get orders."],
                ["Customers", "Discover Drops", "Browse streetwear and track orders."],
                ["App Feel", "Shop Mobile", "Dashboard, cart and checkout."],
              ].map(([eyebrow, title, text], index) => (
                <div
                  key={title}
                  className={`rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md ${index % 2 === 1 ? "translate-y-5" : ""
                    }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                    {eyebrow}
                  </p>
                  <h3 className="mt-2 text-base font-black">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop cards */}
          <div className="relative hidden h-[520px] lg:block">
            <div className="absolute left-10 top-8 w-80 rotate-[-2deg] rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-bold text-white/40">Marketplace</p>
              <h3 className="mt-3 text-3xl font-black">The Village</h3>
              <p className="mt-4 text-sm leading-6 text-white/55">
                A streetwear platform helping local brands sell, grow and get discovered.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Brands", "Products", "Orders"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute right-0 top-0 w-72 rotate-[5deg] rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-bold text-white/40">For Brands</p>
              <h3 className="mt-3 text-2xl font-black">Start Selling</h3>
              <p className="mt-4 text-sm leading-6 text-white/55">
                Upload your apparel, manage your catalog and reach customers online.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Dashboard", "Catalog", "Sales"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute bottom-10 left-0 w-72 rotate-[4deg] rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-bold text-white/40">For Customers</p>
              <h3 className="mt-3 text-2xl font-black">Discover Drops</h3>
              <p className="mt-4 text-sm leading-6 text-white/55">
                Browse local streetwear, find fresh designs and track your orders.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Drops", "Cart", "Tracking"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 right-6 w-80 rotate-[-3deg] rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-bold text-white/40">Mobile App Experience</p>
              <h3 className="mt-3 text-2xl font-black">Shop Like an App</h3>
              <p className="mt-4 text-sm leading-6 text-white/55">
                Bottom navigation, dashboard, product pages and cart built for mobile.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Mobile", "Orders", "Checkout"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-white/10" />
      </section>

      <Suspense fallback={<CatalogLoading />}>
        <Catalog />
      </Suspense>

      <section className="bg-black text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] order-2 lg:order-1">
              <img
                src="/joziHome.jpg"
                alt="Featured Design"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-4 sm:px-8 order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 sm:mb-6">
                STAND OUT. BE SEEN.<br />
                REDEFINING STREETWEAR WITH<br />
                UNMATCHED EDGE AND VISION.
              </h2>
              <Link href="/products" className="bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-xs sm:text-sm hover:bg-gray-200 transition-colors">
                EXPLORE DESIGNS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="group cursor-pointer">
              <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden">
                <img
                  src="/panda.png"
                  alt="Premium Cotton Collection"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                {/* Dark gradient overlay for edgy contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-6 sm:p-8 lg:p-12 text-left">
                  <p className="text-white text-lg sm:text-xl font-bold uppercase mb-10 opacity-90 drop-shadow-lg">
                    CLEAN. TIMELESS. ESSENTIAL.
                  </p>
                  <Link href={"/products"} className="mt-8 bg-white text-black font-bold px-8 py-4 text-base sm:text-lg uppercase tracking-wide">
                    Explore Collection
                  </Link>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0"
                  alt="Modern Alter Collection"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-6 sm:p-8 lg:p-12 text-left">
                  <p className="text-white text-lg sm:text-xl font-bold uppercase mb-8 opacity-90 drop-shadow-lg">
                    EDGE. VISION. REDEFINED.
                  </p>
                  <Link href={"/about"} className="mt-8 bg-white text-black font-bold px-8 py-4 text-base sm:text-lg uppercase tracking-wide">
                    OUR STORY
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <NewsletterSignup />
    </div>
  );
}