export function StatsCard({
  icon: Icon,
  title,
  value,
  text,
}: {
  icon: any;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <Icon className="mb-5 h-7 w-7 text-white/60" />
      <p className="text-sm font-bold text-white/40">{title}</p>
      <h2 className="mt-2 text-3xl font-black">{value}</h2>
      <p className="mt-1 text-sm text-white/50">{text}</p>
    </div>
  );
}