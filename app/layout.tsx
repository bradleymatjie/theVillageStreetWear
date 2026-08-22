import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import { Toaster } from "sonner";
import Script from "next/script";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { siteConfig } from "@/app/lib/seo";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | The Village",
  },
  description: siteConfig.description,

  keywords: [
    "The Village",
    "South African streetwear marketplace",
    "South African streetwear",
    "local fashion brands",
    "independent clothing brands",
    "street fashion South Africa",
    "streetwear drops",
    "Johannesburg streetwear",
  ],

  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "The Village streetwear marketplace",
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

  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },

  category: "fashion",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Load gtag.js */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        {/* Initialize gtag */}
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className={`${poppins.variable} antialiased`}>
         <ThemeProvider attribute="class" defaultTheme="dark">
        <div>
          <Suspense fallback={null}>
          <Header />
          <GoogleAnalytics />
          {children}
          <Footer />
          </Suspense>
        </div>
         </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
