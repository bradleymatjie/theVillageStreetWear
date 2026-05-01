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
<section className="relative overflow-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28">
  <div className="mx-auto max-w-7xl">
    <div className="max-w-3xl">
      <p className="mb-4 inline-flex border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
        Now onboarding early brands
      </p>

      <h1 className="text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
        A Marketplace for
        <br />
        Streetwear Brands.
      </h1>

      <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-white/80 sm:text-lg lg:text-xl">
        Discover unique streetwear or start selling your brand to a growing audience
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex items-center justify-center bg-white px-7 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-white/80"
        >
          Explore Designs
        </Link>

        <Link
          href="/sell"
          className="inline-flex items-center justify-center border border-white/30 px-7 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
        >
          Join as a Brand
        </Link>
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