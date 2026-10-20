

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-theme-ink pb-24 text-theme-base transition-colors dark:bg-theme-base dark:text-theme-ink lg:pb-0">
      <section>
        {children}
      </section>


    </main>
  );
}
