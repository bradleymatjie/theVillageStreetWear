import { formatDistanceToNow } from 'date-fns';

interface Customer {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
  updated_at: string;
}

async function fetchCustomers(): Promise<Customer[]> {
  // Build absolute URL: dev uses localhost, prod uses Vercel domain (or set NEXT_PUBLIC_BASE_URL in .env)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/customers`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  return response.json();
}

export default async function CustomersPage() {
  let customers: Customer[] = [];
  let error: string | null = null;

  try {
    customers = await fetchCustomers();
  } catch (err) {
    error = err instanceof Error ? err.message : 'An error occurred';
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold uppercase mb-6">Customers</h1>
        <div className="p-6 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-between items-center mx-2'>
      <h1 className="text-3xl font-bold uppercase mb-6">Customers</h1>
      <p>{customers.length} Total</p>
      </div>

      {customers.length === 0 ? (
        <div className="p-6 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg">
          <p className="text-gray-400">No customers found.</p>
        </div>
      ) : (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#1A1A1A]">
                <th className="text-left p-4 font-semibold text-gray-300">User ID</th>
                <th className="text-left p-4 font-semibold text-gray-300">Full Name</th>
                <th className="text-left p-4 font-semibold text-gray-300">Email</th>
                <th className="text-left p-4 font-semibold text-gray-300">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const createdAt = customer.created_at 
                  ? formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })
                  : 'N/A';
                const updatedAt = formatDistanceToNow(new Date(customer.updated_at), { addSuffix: true });

                return (
                  <tr key={customer.id} className="border-b border-[#1A1A1A] hover:bg-[#1A1A1A]">
                    <td className="p-4 text-gray-300">{customer.user_id}</td>
                    <td className="p-4 text-white">{customer.full_name ?? 'N/A'}</td>
                    <td className="p-4 text-gray-300">{customer.email}</td>
                    <td className="p-4 text-gray-300">{updatedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}