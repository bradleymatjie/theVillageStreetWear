import BottomNav from "./components/BottomNav";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-black transition-colors dark:bg-black dark:text-white md:pb-0">
      <section>
        {children}
      </section>

      <BottomNav />
    </main>
  );
}
