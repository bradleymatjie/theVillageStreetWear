"use client";

import { useState } from "react";

export default function ActionButtons({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: "approved" | "rejected") => {
    setLoading(true);

    const res = await fetch("/api/admin/applications", {
      method: "POST",
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      alert("Something went wrong");
      setLoading(false);
      return;
    }

    window.location.reload(); // quick refresh
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        onClick={() => updateStatus("approved")}
        disabled={loading}
        className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black"
      >
        {loading ? "..." : "Approve"}
      </button>

      <button
        onClick={() => updateStatus("rejected")}
        disabled={loading}
        className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white/70"
      >
        Reject
      </button>
    </div>
  );
}