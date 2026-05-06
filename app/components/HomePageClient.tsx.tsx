"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion, type Transition, type Variants } from "framer-motion";

type Props = {
  children?: ReactNode;
  showBottomSections?: boolean;
};

const spring: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 16,
  mass: 0.9,
};

const dropIn: Variants = {
  hidden: {
    opacity: 0,
    y: -80,
    scale: 0.92,
    filter: "blur(14px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: spring,
  },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.15,
    },
  },
};

const sectionReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.96,
    filter: "blur(12px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: spring,
  },
};

const mobileCards = [
  ["Marketplace", "The Village", "Local brands selling online."],
  ["For Brands", "Start Selling", "Upload apparel and get orders."],
  ["Customers", "Discover Drops", "Browse streetwear and track orders."],
  ["App Feel", "Shop Mobile", "Dashboard, cart and checkout."],
];

const desktopCards = [
  {
    title: "The Village",
    eyebrow: "Marketplace",
    text: "A streetwear platform helping local brands sell, grow and get discovered.",
    tags: ["Brands", "Products", "Orders"],
    className: "absolute left-10 top-8 w-80 rotate-[-2deg]",
  },
  {
    title: "Start Selling",
    eyebrow: "For Brands",
    text: "Upload your apparel, manage your catalog and reach customers online.",
    tags: ["Dashboard", "Catalog", "Sales"],
    className: "absolute right-0 top-0 w-72 rotate-[5deg]",
  },
  {
    title: "Discover Drops",
    eyebrow: "For Customers",
    text: "Browse local streetwear, find fresh designs and track your orders.",
    tags: ["Drops", "Cart", "Tracking"],
    className: "absolute bottom-10 left-0 w-72 rotate-[4deg]",
  },
  {
    title: "Shop Like an App",
    eyebrow: "Mobile App Experience",
    text: "Bottom navigation, dashboard, product pages and cart built for mobile.",
    tags: ["Mobile", "Orders", "Checkout"],
    className: "absolute bottom-0 right-6 w-80 rotate-[-3deg]",
  },
];

export default function HomePageClient({
  children,
  showBottomSections,
}: Props) {
  if (showBottomSections) {
    return (
      <>
        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="bg-black px-4 py-12 text-white sm:px-6 sm:py-16 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative order-2 h-[300px] overflow-hidden rounded-[2rem] sm:h-[400px] lg:order-1 lg:h-[500px]"
              >
                <img
                  src="/joziHome.jpg"
                  alt="Featured Design"
                  className="h-full w-full object-cover"
                />
              </motion.div>

              <motion.div
                variants={stagger}
                className="order-1 px-4 sm:px-8 lg:order-2"
              >
                <motion.h2
                  variants={dropIn}
                  className="mb-4 text-3xl font-black leading-tight sm:mb-6 sm:text-4xl lg:text-5xl"
                >
                  STAND OUT. BE SEEN.
                  <br />
                  REDEFINING STREETWEAR WITH
                  <br />
                  UNMATCHED EDGE AND VISION.
                </motion.h2>

                <motion.div variants={dropIn}>
                  <Link
                    href="/products"
                    className="inline-flex rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-black transition hover:scale-[1.03] hover:bg-gray-200 sm:px-8 sm:text-sm"
                  >
                    Explore Designs
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-black px-4 py-8 sm:px-6 sm:py-12 lg:py-16"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {[
                {
                  href: "/products",
                  image: "/panda.png",
                  text: "CLEAN. TIMELESS. ESSENTIAL.",
                  button: "Explore Collection",
                },
                {
                  href: "/about",
                  image:
                    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0",
                  text: "EDGE. VISION. REDEFINED.",
                  button: "Our Story",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 120, scale: 0.92 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 70,
                    damping: 16,
                    delay: index * 0.15,
                  }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                >
                  <div className="relative h-[300px] overflow-hidden rounded-[2rem] sm:h-[350px] lg:h-[400px]">
                    <img
                      src={item.image}
                      alt={item.text}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6 text-left sm:p-8 lg:p-12">
                      <p className="mb-8 text-lg font-bold uppercase text-white opacity-90 drop-shadow-lg sm:text-xl">
                        {item.text}
                      </p>

                      <Link
                        href={item.href}
                        className="inline-flex rounded-full bg-white px-8 py-4 text-base font-bold uppercase tracking-wide text-black"
                      >
                        {item.button}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {children}
        </motion.div>
      </>
    );
  }

  return (
    <section className="relative min-h-[calc(100dvh-72px)] overflow-hidden bg-black px-4 py-10 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <motion.div
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.25 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/joziHome.jpg')" }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="max-w-3xl"
        >
          <motion.p
            variants={dropIn}
            className="mb-4 inline-flex border border-white/20 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 backdrop-blur sm:text-xs"
          >
            Now onboarding early brands
          </motion.p>

          <motion.h1
            variants={dropIn}
            className="text-4xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl"
          >
            A Marketplace for
            <br />
            Streetwear Brands.
          </motion.h1>

          <motion.p
            variants={dropIn}
            className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/80 sm:text-lg lg:text-xl"
          >
            Discover unique streetwear or start selling your brand to a growing
            audience.
          </motion.p>

          <motion.div
            variants={dropIn}
            className="mt-8 grid grid-cols-1 gap-3 sm:flex sm:flex-row"
          >
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.03] hover:bg-white/90"
            >
              Explore Catalog
            </Link>

            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-black/20 px-7 py-4 text-sm font-black uppercase tracking-wide text-white backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white hover:text-black"
            >
              Join as a Brand
            </Link>
          </motion.div>

          <motion.div variants={stagger} className="mt-10 grid grid-cols-2 gap-3 lg:hidden">
            {mobileCards.map(([eyebrow, title, text], index) => (
              <motion.div
                key={title}
                variants={dropIn}
                whileHover={{ y: -8, scale: 1.03 }}
                className={`rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl ${
                  index % 2 === 1 ? "translate-y-5" : ""
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                  {eyebrow}
                </p>
                <h3 className="mt-2 text-base font-black">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/60">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative hidden h-[520px] lg:block"
        >
          {desktopCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{
                opacity: 0,
                y: -150,
                scale: 0.7,
                filter: "blur(20px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 14,
                delay: 0.2 + index * 0.12,
              }}
              whileHover={{ y: -14, scale: 1.04 }}
              className={`${card.className} rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl`}
            >
              <p className="text-sm font-bold text-white/40">{card.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-black">{card.title}</h3>
              <p className="mt-4 text-sm leading-6 text-white/55">
                {card.text}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
    </section>
  );
}