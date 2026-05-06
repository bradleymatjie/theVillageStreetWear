import { supabase } from "@/lib/supabaseClient";
import ActionButtons from "./ActionButtons";

export const dynamic = "force-dynamic";

type BrandApplication = {
  id: string;
  owner_name: string;
  email: string;
  phone: string;
  brand_name: string;
  instagram?: string;
  plan: string;
  description?: string;
  status: string;
  created_at: string;
};

export default async function BrandApplicationsPage() {
 const { data, error } = await supabase
  .from("brand_applications")
  .select("*")
  .neq("status", "approved")
  .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <p className="text-red-400">Error loading applications.</p>
        <p className="mt-2 text-sm text-white/50">{error.message}</p>
      </main>
    );
  }

  const applications = (data || []) as BrandApplication[];

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">
            Brand Applications
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Review brands that applied to join The Village.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="font-bold">No applications yet</p>
            <p className="mt-2 text-sm text-white/50">
              New brand applications will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black">{app.brand_name}</h2>
                      <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400">
                        {app.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-white/50">
                      Owner: {app.owner_name}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-black">
                    {app.plan}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-white/40">Email</p>
                    <p className="font-bold">{app.email}</p>
                  </div>

                  <div>
                    <p className="text-white/40">Phone</p>
                    <p className="font-bold">{app.phone}</p>
                  </div>

                  <div>
                    <p className="text-white/40">Instagram</p>
                    <p className="font-bold">{app.instagram || "Not added"}</p>
                  </div>

                  <div>
                    <p className="text-white/40">Applied</p>
                    <p className="font-bold">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {app.description && (
                  <div className="mt-5 rounded-2xl bg-black/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                      About brand
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {app.description}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                   <ActionButtons id={app.id} />

                  <a
                    href={`https://wa.me/${app.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-black text-white/70"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}