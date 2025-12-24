export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold uppercase mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg">
          <h2 className="text-xl font-semibold">Total Sales</h2>
          <p className="text-3xl mt-4">R 0.00</p>
        </div>

        <div className="p-6 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg">
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-3xl mt-4">0</p>
        </div>

        <div className="p-6 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg">
          <h2 className="text-xl font-semibold">Customers</h2>
          <p className="text-3xl mt-4">0</p>
        </div>
      </div>
    </div>
  );
}
