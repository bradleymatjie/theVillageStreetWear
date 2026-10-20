export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-theme-ink/10 bg-theme-ink/10 px-3 py-1 text-xs font-bold capitalize text-theme-ink/70">
      {children}
    </span>
  );
}