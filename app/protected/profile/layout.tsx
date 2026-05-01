import BottomNav from "./components/BottomNav";
import { Poppins, Lato } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={`${poppins.variable} ${lato.variable} min-h-screen bg-black text-white p-4 pb-20 font-sans`}
    >
      {children}
      <BottomNav />
    </main>
  );
}