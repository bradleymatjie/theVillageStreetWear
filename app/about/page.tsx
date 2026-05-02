// app/about/page.tsx
import { MapPin, Mail, Phone, Store, Shirt, Users, PackageCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative flex h-[60vh] items-center justify-center overflow-hidden md:h-[70vh]">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/70 to-black" />

        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px)",
            }}
          />
        </div>

        <div className="relative z-20 mx-auto max-w-5xl px-4 text-center">
          <h1 className="mb-6 text-6xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
            THE VILLAGE
          </h1>
          <p className="text-xl font-light uppercase tracking-wide text-gray-300 sm:text-2xl md:text-3xl">
            A Marketplace for Streetwear Brands
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-black uppercase tracking-tight sm:text-5xl">
                The Platform
              </h2>

              <div className="space-y-4 text-lg leading-relaxed text-gray-300">
                <p>
                  The Village is a marketplace built for streetwear brands to
                  launch, sell, and grow online.
                </p>
                <p>
                  We connect creators with customers through a seamless,
                  mobile-first shopping experience — from product discovery to
                  orders and delivery tracking.
                </p>
                <p className="font-semibold text-white">
                  This is where brands are built.
                </p>
              </div>
            </div>

            <div className="relative h-[400px] overflow-hidden rounded-2xl bg-white/5 md:h-[500px]">
              <Image
                src="/jozi.jpg"
                width={700}
                height={700}
                alt="Johannesburg street culture"
                className="h-full w-full object-cover object-bottom"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 text-black sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-5xl font-black uppercase tracking-tight sm:text-6xl">
            Our Mission
          </h2>
          <p className="text-xl font-light leading-relaxed sm:text-2xl">
            To empower streetwear brands to launch faster, sell smarter, and
            reach a wider audience — starting from the streets of Johannesburg.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="relative order-2 h-[400px] overflow-hidden rounded-2xl bg-white/5 md:order-1">
              <Image
                src="/leo.png"
                width={700}
                height={700}
                alt="Streetwear product showcase"
                className="h-full w-full object-cover object-bottom"
              />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="mb-6 text-4xl font-black uppercase tracking-tight sm:text-5xl">
                Create & Sell Your Designs
              </h2>

              <div className="space-y-4 text-lg leading-relaxed text-gray-300">
                <p>
                  Turn your ideas into products and sell them on The Village.
                  Design custom apparel, launch your own drops, and start
                  building your brand.
                </p>
                <p>
                  Whether you already have a clothing label or you’re starting
                  from scratch, The Village gives you a place to showcase,
                  promote, and sell.
                </p>
                <p className="font-semibold text-white">
                  Your brand. Your products. Your marketplace.
                </p>

                <Link
                  href="/sell"
                  className="mt-6 inline-block bg-white px-8 py-3 font-bold uppercase tracking-wider text-black transition-colors hover:bg-gray-200"
                >
                  Join as a Brand
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-5xl font-black uppercase tracking-tight">
            What We Stand For
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Store,
                title: "Creator First",
                text: "We build tools that help brands launch and grow without friction.",
              },
              {
                icon: PackageCheck,
                title: "Reliable Commerce",
                text: "Products, orders, and customer journeys need to feel simple and professional.",
              },
              {
                icon: Shirt,
                title: "Brand Freedom",
                text: "Every brand deserves space to express its own style, voice, and identity.",
              },
              {
                icon: Users,
                title: "Community",
                text: "The Village is built around local creators, customers, and streetwear culture.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="border border-white/20 p-8 transition-colors hover:bg-white/5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-5xl font-black text-white/20">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="h-7 w-7 text-white/40" />
                  </div>

                  <h3 className="mb-3 text-2xl font-bold uppercase">
                    {item.title}
                  </h3>
                  <p className="text-gray-400">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 text-black sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-5xl font-black uppercase tracking-tight sm:text-6xl">
            Start Your Brand
          </h2>
          <p className="mb-12 text-xl">
            Want to sell on The Village? Let’s get your brand live.
          </p>

          <div className="mb-12 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="mb-2 h-8 w-8" />
              <span className="font-semibold">Location</span>
              <span className="text-gray-600">Johannesburg, SA</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <Mail className="mb-2 h-8 w-8" />
              <span className="font-semibold">Email</span>
              <Link
                href="mailto:thevillagestreetwear@gmail.com"
                className="text-gray-600 transition-colors hover:text-black"
              >
                thevillagestreetwear@gmail.com
              </Link>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <Phone className="mb-2 h-8 w-8" />
              <span className="font-semibold">Phone</span>
              <Link
                href="tel:+27729509295"
                className="text-gray-600 transition-colors hover:text-black"
              >
                072 950 9295
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/sell"
              className="inline-block bg-black px-12 py-4 text-lg font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-900"
            >
              Start Selling
            </Link>

            <Link
              href="/products"
              className="inline-block border border-black px-12 py-4 text-lg font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-8 text-center">
        <p className="text-sm uppercase tracking-widest text-gray-500">
          Est. 2025 • Johannesburg, South Africa • The Village Marketplace
        </p>
      </section>
    </div>
  );
}