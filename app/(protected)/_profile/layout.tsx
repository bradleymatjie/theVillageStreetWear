

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-theme-base pb-24 text-theme-ink transition-colors lg:pb-0">
      <section>
        {children}
      </section>


    </main>
  );
}
