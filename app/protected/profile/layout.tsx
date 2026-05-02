import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-black pb-24 transition-colors dark:bg-black dark:text-white lg:pb-0">
      <Sidebar />

      <section className="lg:ml-72">
        {children}
      </section>

      <BottomNav />
    </main>
  );
}