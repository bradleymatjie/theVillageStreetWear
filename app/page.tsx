import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Catalog from './components/catalog/page';
import { Suspense } from 'react';
import CatalogLoading from './components/catalog/loading';

export default function Page() {

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-center min-h-[500px] sm:min-h-[600px]">
            <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-12 order-1 lg:order-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-4 sm:mb-6">
                CREATE YOUR<br />STYLE
              </h1>
              <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 font-bold">
                DESIGN CUSTOM TEES WITH<br />
                PRINTWAVES BOLD STYLE,<br />
                UNAPOLOGETIC ATTITUDE
              </p>
              <Link prefetch href={'/studio'} className="bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-xs sm:text-sm hover:bg-gray-200 transition-colors">
                START DESIGNING
              </Link>
            </div>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[600px] bg-gray-900 order-2 lg:order-2">
              <img
                src="/leo.png"
                alt="Custom T-shirt Design"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>
      <Suspense fallback={<CatalogLoading />}>
        <Catalog />
      </Suspense>

      <section className="bg-black text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=500&fit=crop"
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
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="group cursor-pointer">
              <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] bg-gray-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=400&fit=crop"
                  alt="Collection 1"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8">
                  <h3 className="text-white text-2xl sm:text-3xl font-black mb-1 sm:mb-2">COLLECTION</h3>
                  <p className="text-white text-lg sm:text-xl font-bold">100% COTTON</p>
                  <button className="mt-3 sm:mt-4 flex items-center gap-2 text-white text-sm sm:text-base font-bold hover:underline">
                    SEE MORE <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] bg-gray-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Collection 2"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8">
                  <h3 className="text-white text-2xl sm:text-3xl font-black mb-1 sm:mb-2">COLLECTION</h3>
                  <p className="text-white text-lg sm:text-xl font-bold">X MODERN ALTER</p>
                  <button className="mt-3 sm:mt-4 flex items-center gap-2 text-white text-sm sm:text-base font-bold hover:underline">
                    SEE MORE <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}