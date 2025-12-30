import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "The Village | Custom Streetwear",
    template: "%s | The Village",
  },
  description:
    "The Village is a South African streetwear brand offering custom-designed apparel. Create your style with premium quality street fashion.",

  keywords: [
    "The Village Streetwear",
    "South African streetwear",
    "custom streetwear",
    "urban fashion",
    "custom t-shirts",
    "street fashion SA",
  ],

  authors: [{ name: "The Village" }],
  creator: "The Village",
  publisher: "The Village",

  metadataBase: new URL("https://thevillagestreetwear.com"),

  openGraph: {
    title: "The Village - Custom Streetwear",
    description:
      "Design and wear premium custom streetwear from The Village. Built for the culture.",
    url: "https://thevillagestreetwear.com",
    siteName: "The Village - streetwear",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Village Streetwear",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "fashion",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <div className="pt-12">
          <Header />
          {children}
          <Footer />
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}