"use client";

import Link from "next/link";
import HeroVideoBackground from "./HeroVideoBackground";
import { ReactNode } from "react";
import { motion, type Transition, type Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";

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
  ["Curated", "Local Labels", "Independent streetwear in one place."],
  ["Fresh", "Latest Drops", "New pieces from emerging brands."],
  ["Simple", "Fast Checkout", "Cart, payment and order updates."],
  ["Growth", "For Brands", "Tools to list, sell and manage stock."],
];

const desktopCards = [
  {
    title: "Local labels, real drops",
    eyebrow: "Marketplace",
    text: "A focused shopfront for South African streetwear brands with products, checkout and order tracking.",
    tags: ["Streetwear", "Accessories", "Drops"],
    className: "absolute left-8 top-8 w-80 rotate-[-2deg]",
  },
  {
    title: "Built for sellers",
    eyebrow: "For Brands",
    text: "Upload products, manage catalog details and get a cleaner path from discovery to paid order.",
    tags: ["Catalog", "Stock", "Orders"],
    className: "absolute right-2 top-4 w-72 rotate-[3deg]",
  },
  {
    title: "Shop with confidence",
    eyebrow: "For Customers",
    text: "Browse the catalog, add favorites to cart and follow your order after checkout.",
    tags: ["Cart", "Payments", "Tracking"],
    className: "absolute bottom-12 left-0 w-72 rotate-[4deg]",
  },
  {
    title: "Made for mobile",
    eyebrow: "Everyday shopping",
    text: "A quick, thumb-friendly storefront for the way customers actually discover and buy.",
    tags: ["Mobile", "Fast", "Simple"],
    className: "absolute bottom-0 right-8 w-80 rotate-[-3deg]",
  },
];

const trustPoints = [
  { icon: Store, label: "Brand storefronts" },
  { icon: ShoppingBag, label: "Curated catalog" },
  { icon: PackageCheck, label: "Order tracking" },
  { icon: Truck, label: "SA delivery" },
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
          className="bg-theme-base px-4 py-12 text-theme-ink sm:px-6 sm:py-16 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative order-2 h-[300px] overflow-hidden rounded-lg sm:h-[420px] lg:order-1 lg:h-[520px]"
              >
                <img
                  src="/joziHome.jpg"
                  alt="Featured Design"
                  className="h-full w-full object-cover"
                />
                <div className="theme-media absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-theme-base/70 p-4 backdrop-blur-md">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-theme-ink/70">
                    Johannesburg streetwear
                  </p>
                  <BadgeCheck className="h-5 w-5 text-theme-ink" />
                </div>
              </motion.div>

              <motion.div
                variants={stagger}
                className="order-1 lg:order-2 lg:pl-8"
              >
                <motion.p
                  variants={dropIn}
                  className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-theme-ink/45"
                >
                  Streetwear, sharpened
                </motion.p>
                <motion.h2
                  variants={dropIn}
                  className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl"
                >
                  STAND OUT IN PIECES THAT FEEL LOCAL, LIMITED AND READY TO MOVE.
                </motion.h2>
                <motion.p
                  variants={dropIn}
                  className="mt-5 max-w-xl text-sm leading-7 text-theme-ink/60 sm:text-base"
                >
                  The Village connects shoppers with independent brands, making
                  discovery, checkout and delivery easier from the first drop.
                </motion.p>

              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="theme-paper bg-theme-ink px-4 py-12 text-theme-base sm:px-6 sm:py-16"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.75fr]">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-theme-base/40">
                Browse the labels
              </p>
              <h2 className="max-w-3xl text-4xl font-black leading-none sm:text-5xl lg:text-6xl">
                DISCOVER THE BRANDS BUILDING IN THE VILLAGE.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-theme-base/60 sm:text-base">
                Explore independent South African streetwear labels, read their
                stories, and shop products directly from each brand storefront.
              </p>
            </div>

            <div className="border border-theme-base/10 bg-theme-base p-5 text-theme-ink">
              <div className="grid gap-3">
                {["Brand storefronts", "Location filters", "Category filters"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between border border-theme-ink/10 bg-theme-ink/[0.04] px-4 py-3"
                    >
                      <span className="text-sm font-bold text-theme-ink/65">
                        {item}
                      </span>
                      <ArrowRight className="h-4 w-4 text-theme-ink/45" />
                    </div>
                  )
                )}
              </div>
              <Link
                href="/brands"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-theme-ink px-6 py-4 text-sm font-black uppercase tracking-wide text-theme-base transition hover:bg-theme-ink/85"
              >
                Explore Brands
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-theme-base px-4 py-8 sm:px-6 sm:py-12 lg:py-16"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-4 border-y border-theme-ink/10 py-5 sm:flex-row sm:items-center">
              {trustPoints.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-theme-ink">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-theme-ink/15 bg-theme-ink/5">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-theme-ink/60">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {[
                {
                  href: "/products",
                  image: "/panda.png",
                  text: "FIND YOUR NEXT DAILY PIECE.",
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
                  <div className="theme-media relative h-[300px] overflow-hidden rounded-lg sm:h-[350px] lg:h-[400px]">
                    <img
                      src={item.image}
                      alt={item.text}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6 text-left sm:p-8 lg:p-12">
                      <p className="mb-8 text-lg font-bold uppercase text-theme-ink opacity-90 drop-shadow-lg sm:text-xl">
                        {item.text}
                      </p>

                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 rounded-md bg-theme-ink px-6 py-3 text-sm font-black uppercase tracking-wide text-theme-base"
                      >
                        {item.button}
                        <ArrowRight className="h-4 w-4" />
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
    <section className="theme-media relative min-h-[calc(100dvh-68px)] overflow-hidden bg-theme-base text-theme-ink lg:min-h-[calc(100dvh-82px)]">
      <HeroVideoBackground />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--palette-black-92)_0%,var(--palette-black-16)_58%,var(--palette-black-10)_100%)] lg:bg-[linear-gradient(90deg,var(--palette-black-90)_0%,var(--palette-black-50)_50%,var(--palette-black-15)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-68px)] max-w-[1480px] items-end px-5 pb-28 pt-12 sm:px-8 lg:min-h-[calc(100dvh-82px)] lg:items-center lg:px-10 lg:pb-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="max-w-3xl"
        >
          <motion.p
            variants={dropIn}
            className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-theme-ink/75 sm:text-xs"
          >
            Independent streetwear
          </motion.p>

          <motion.h1
            variants={dropIn}
            className="text-[50px] font-black uppercase leading-[0.86] tracking-[-0.06em] sm:text-7xl lg:text-8xl"
          >
            CULTURE
            <br />IS WORN.
          </motion.h1>

          <motion.p
            variants={dropIn}
            className="mt-5 hidden max-w-xl text-base font-medium leading-7 text-theme-ink/70 sm:block lg:text-lg"
          >
            Discover independent South African labels, shop new drops, and wear the culture shaping the streets.
          </motion.p>

          <motion.div
            variants={dropIn}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-theme-ink px-5 py-3 text-xs font-black uppercase tracking-wide text-theme-base transition hover:-translate-y-0.5 hover:bg-theme-ink/90"
            >
              Explore the drop
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/sell"
              className="hidden items-center justify-center gap-2 rounded-md border border-theme-ink/30 bg-theme-base/25 px-5 py-3 text-xs font-black uppercase tracking-wide text-theme-ink backdrop-blur-xl transition hover:bg-theme-ink hover:text-theme-base sm:inline-flex"
            >
              Join as a Brand
              <Store className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div variants={stagger} className="hidden">
            {mobileCards.map(([eyebrow, title, text], index) => (
              <motion.div
                key={title}
                variants={dropIn}
                whileHover={{ y: -8, scale: 1.03 }}
                className={`rounded-lg border border-theme-ink/10 bg-theme-ink/10 p-4 shadow-2xl backdrop-blur-2xl ${
                  index % 2 === 1 ? "translate-y-5" : ""
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-theme-ink/45">
                  {eyebrow}
                </p>
                <h3 className="mt-2 text-base font-black">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-theme-ink/60">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="hidden"
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
              className={`${card.className} rounded-lg border border-theme-ink/10 bg-theme-ink/[0.08] p-6 shadow-[0_25px_80px_var(--palette-black-45)] backdrop-blur-2xl`}
            >
              <p className="text-sm font-bold text-theme-ink/40">{card.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-black">{card.title}</h3>
              <p className="mt-4 text-sm leading-6 text-theme-ink/55">
                {card.text}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-theme-ink/10 px-3 py-1 text-xs font-bold text-theme-ink/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
