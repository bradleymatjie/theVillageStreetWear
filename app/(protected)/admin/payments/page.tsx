export const dynamic = 'force-dynamic';
export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold uppercase mb-6">Payments</h1>

      <div className="p-6 bg-[var(--palette-surface-admin)] border border-[var(--palette-border-admin)] rounded-lg">
        <p className="text-theme-muted">No payment data available.</p>
      </div>
    </div>
  );
}
