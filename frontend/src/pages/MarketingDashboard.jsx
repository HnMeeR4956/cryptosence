import React, { useEffect, useState } from "react";
import MarketingSidebar from "../components/MarketingSidebar";

const API_BASE = "https://cryptosence.onrender.com/api/marketing";

function MarketingDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load dashboard");
      }

      setData(result);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = data?.stats || {};

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <MarketingSidebar />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto min-w-0">
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80">
                  Marketing Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                  Marketing activity overview
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  View strategy progress, growth data, and media status in one place.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-slate-300">
                Welcome back, Marketing User
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-6 text-slate-400 shadow-2xl shadow-black/30">
                Loading dashboard...
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Total Strategies"
                    value={stats.totalStrategies || 0}
                  />
                  <StatCard
                    label="Active Strategies"
                    value={stats.activeStrategies || 0}
                  />
                  <StatCard
                    label="Growth Entries"
                    value={stats.totalGrowthEntries || 0}
                  />
                  <StatCard
                    label="Media Items"
                    value={stats.totalMediaItems || 0}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Signups"
                    value={stats.totalSignups || 0}
                  />
                  <StatCard
                    label="Conversions"
                    value={stats.totalConversions || 0}
                  />
                  <StatCard
                    label="Revenue (PKR)"
                    value={(stats.totalRevenue || 0).toLocaleString()}
                  />
                  <StatCard
                    label="Published Media"
                    value={stats.mediaPublished || 0}
                  />
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-3">
                  <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30 xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Recent Strategies</h2>
                        <p className="text-sm text-slate-400">
                          Latest campaign plans created by marketing.
                        </p>
                      </div>
                    </div>

                    {data.recentStrategies?.length ? (
                      <div className="space-y-4">
                        {data.recentStrategies.map((item) => (
                          <div
                            key={item._id}
                            className="rounded-2xl border border-white/10 bg-[#050b16] p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-semibold text-white">
                                {item.title}
                              </h3>
                              <Badge status={item.status} />
                            </div>
                            <p className="mt-2 text-sm text-slate-400">
                              {item.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                              <span>Audience: {item.targetAudience}</span>
                              <span>Budget: PKR {Number(item.budget || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No strategies found.</p>
                    )}
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold">Recent Growth</h2>
                      <p className="text-sm text-slate-400">
                        Latest campaign tracking entries.
                      </p>
                    </div>

                    {data.recentGrowth?.length ? (
                      <div className="space-y-4">
                        {data.recentGrowth.map((item) => (
                          <div
                            key={item._id}
                            className="rounded-2xl border border-white/10 bg-[#050b16] p-4"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-white">
                                {item.title}
                              </h3>
                              <Badge status={item.status} />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                              {item.channel}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                              <span>Clicks: {item.clicks}</span>
                              <span>Signups: {item.signups}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No growth entries found.</p>
                    )}
                  </section>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold">Recent Media</h2>
                      <p className="text-sm text-slate-400">
                        Latest uploaded marketing files and links.
                      </p>
                    </div>

                    {data.recentMedia?.length ? (
                      <div className="space-y-4">
                        {data.recentMedia.map((item) => (
                          <div
                            key={item._id}
                            className="rounded-2xl border border-white/10 bg-[#050b16] p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-semibold text-white">
                                {item.title}
                              </h3>
                              <MediaBadge status={item.status} />
                            </div>
                            <p className="mt-2 text-sm text-slate-400">
                              {item.mediaType}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              {item.fileName || item.externalLink || "No file attached"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No media uploaded yet.</p>
                    )}
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold">Quick Summary</h2>
                      <p className="text-sm text-slate-400">
                        Current campaign breakdown.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <ProgressRow label="Planned Strategies" value={stats.plannedStrategies || 0} total={stats.totalStrategies || 1} />
                      <ProgressRow label="Active Strategies" value={stats.activeStrategies || 0} total={stats.totalStrategies || 1} />
                      <ProgressRow label="Completed Strategies" value={stats.completedStrategies || 0} total={stats.totalStrategies || 1} />
                      <ProgressRow label="Published Media" value={stats.mediaPublished || 0} total={stats.totalMediaItems || 1} />
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Badge({ status }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border";

  if (status === "Active") {
    return (
      <span className={`${base} border-emerald-400/20 bg-emerald-500/10 text-emerald-300`}>
        Active
      </span>
    );
  }

  if (status === "Completed") {
    return (
      <span className={`${base} border-violet-400/20 bg-violet-500/10 text-violet-300`}>
        Completed
      </span>
    );
  }

  if (status === "Published") {
    return (
      <span className={`${base} border-emerald-400/20 bg-emerald-500/10 text-emerald-300`}>
        Published
      </span>
    );
  }

  if (status === "Archived") {
    return (
      <span className={`${base} border-slate-400/20 bg-slate-500/10 text-slate-300`}>
        Archived
      </span>
    );
  }

  return (
    <span className={`${base} border-yellow-400/20 bg-yellow-500/10 text-yellow-300`}>
      Planned
    </span>
  );
}

function MediaBadge({ status }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
      {status}
    </span>
  );
}

function ProgressRow({ label, value, total }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">
          {value} / {total}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/5">
        <div
          className="h-3 rounded-full bg-cyan-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default MarketingDashboard;