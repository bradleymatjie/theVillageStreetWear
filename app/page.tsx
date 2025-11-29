import React from 'react';
import { ChevronRight, Search, ShoppingCart, User } from 'lucide-react';

export default function PrintWavesWebsite() {
  const collaborationItems = [
    { name: 'CUSTOM TEE', price: '$24.99', soldOut: false },
    { name: 'DESIGNER LONG SLEEVE', price: '$34.99', soldOut: false },
    { name: 'PREMIUM PRINT TEE', price: '$29.99', soldOut: false },
    { name: 'CLASSIC HOODIE', price: '$49.99', soldOut: false }
  ];

  const bestSellers = [
    { name: 'CLASSIC PRINT', price: '$24.99' },
    { name: 'HOODIE', price: '$49.99' },
    { name: 'GRAPHIC TEE', price: '$27.99' },
    { name: 'PREMIUM TEE', price: '$32.99' },
    { name: 'CUSTOM PRINT', price: '$26.99' },
    { name: 'OVERSIZED TEE', price: '$29.99' },
    { name: 'STREETWEAR', price: '$34.99' },
    { name: 'LONG SLEEVE', price: '$39.99' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="text-xl sm:text-2xl font-black">PrintWaves</div>
          <nav className="hidden lg:flex gap-4 xl:gap-8">
            <a href="#" className="text-xs sm:text-sm font-medium hover:underline">NEW DROP</a>
            <a href="#" className="text-xs sm:text-sm font-medium hover:underline">CATALOG</a>
            <a href="#" className="text-xs sm:text-sm font-medium hover:underline">ABOUT</a>
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
            <User className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          </div>
        </div>
      </header>

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
              <button className="bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-xs sm:text-sm hover:bg-gray-200 transition-colors">
                START DESIGNING
              </button>
            </div>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[600px] bg-gray-900 order-2 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=600&fit=crop" 
                alt="Custom T-shirt Design"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-black">COLLABORATION</h2>
            <button className="flex items-center gap-2 text-xs sm:text-sm font-bold hover:underline">
              SEE MORE <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {collaborationItems.map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-square bg-gray-100 mb-2 sm:mb-3 overflow-hidden">
                  <div className="w-full h-full bg-black flex items-center justify-center transform group-hover:scale-105 transition-transform">
                    <div className="text-white text-2xl sm:text-3xl lg:text-4xl">👕</div>
                  </div>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm">{item.name}</h3>
                  </div>
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-black">BEST SELLERS</h2>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white text-xs font-bold">ALL</button>
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black text-xs font-bold border border-black">T-SHIRTS</button>
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black text-xs font-bold border border-black">HOODIES</button>
              <button className="hidden sm:block px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black text-xs font-bold border border-black">LONG SLEEVE</button>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {bestSellers.map((item, index) => (
              <div key={index} className="group cursor-pointer bg-white p-3 sm:p-4">
                <div className="aspect-square bg-gray-100 mb-2 sm:mb-3 overflow-hidden">
                  <div className="w-full h-full bg-black flex items-center justify-center transform group-hover:scale-105 transition-transform">
                    <div className="text-white text-2xl sm:text-3xl lg:text-4xl">👕</div>
                  </div>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-xs sm:text-sm">{item.name}</h3>
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Banner */}
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
              <button className="bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-xs sm:text-sm hover:bg-gray-200 transition-colors">
                EXPLORE DESIGNS
              </button>
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
                  <p className="text-white text-lg sm:text-xl font-bold">X BOX ONE (BLACK)</p>
                  <button className="mt-3 sm:mt-4 flex items-center gap-2 text-white text-sm sm:text-base font-bold hover:underline">
                    SEE MORE <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] bg-gray-100 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop" 
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

          {/* Gallery Grid */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-6 sm:mb-8">#PRINTWAVESSTYLE</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-900 hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="w-full h-full flex items-center justify-center text-white text-xl sm:text-2xl">
                    📸
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">PRODUCT</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">T-SHIRTS</a></li>
                <li><a href="#" className="hover:text-white">HOODIES</a></li>
                <li><a href="#" className="hover:text-white">LONG SLEEVES</a></li>
                <li><a href="#" className="hover:text-white">CUSTOM DESIGN</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">CATALOG</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">NEW ARRIVALS</a></li>
                <li><a href="#" className="hover:text-white">BEST SELLERS</a></li>
                <li><a href="#" className="hover:text-white">COLLABORATIONS</a></li>
                <li><a href="#" className="hover:text-white">COLLECTIONS</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">CUSTOMER SERVICE</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">CONTACT US</a></li>
                <li><a href="#" className="hover:text-white">SHIPPING INFO</a></li>
                <li><a href="#" className="hover:text-white">RETURNS</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">ABOUT PRINTWAVES</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">OUR STORY</a></li>
                <li><a href="#" className="hover:text-white">SUSTAINABILITY</a></li>
                <li><a href="#" className="hover:text-white">CAREERS</a></li>
                <li><a href="#" className="hover:text-white">PRESS</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-6xl font-black mb-3 sm:mb-4 opacity-20">PrintWaves</div>
              <p className="text-xs text-gray-500">© 2024 PRINTWAVES. ALL RIGHTS RESERVED.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}