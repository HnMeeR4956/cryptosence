import React, { useEffect, useMemo, useState } from "react";
import MarketingSidebar from "../components/MarketingSidebar";

const API_BASE = "https://cryptosence.onrender.com/api/marketing";

const emptyForm = {
  title: "",
  description: "",
  targetAudience: "",
  budget: "1000",
  status: "Planned",
};

function MarketingStrategyMaker() {
  const [strategies, setStrategies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [performanceData, setPerformanceData] = useState({});
  const [performanceLoading, setPerformanceLoading] = useState(null);

  const token = localStorage.getItem("token");

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/strategies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load strategies");
      }

      setStrategies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.targetAudience.trim()
    ) {
      setError("Please fill in title, description, and target audience.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        targetAudience: form.targetAudience.trim(),
        budget: Number(form.budget || 1000),
        status: form.status,
      };

      const url = editingId
        ? `${API_BASE}/strategies/${editingId}`
        : `${API_BASE}/strategies`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save strategy");
      }

      setMessage(
        editingId
          ? "Strategy updated successfully."
          : "Strategy created successfully."
      );
      resetForm();
      fetchStrategies();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (strategy) => {
    setEditingId(strategy._id);
    setForm({
      title: strategy.title || "",
      description: strategy.description || "",
      targetAudience: strategy.targetAudience || "",
      budget: strategy.budget?.toString?.() || "1000",
      status: strategy.status || "Planned",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this strategy?");
    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API_BASE}/strategies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("Strategy deleted successfully.");
      fetchStrategies();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  const togglePerformance = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    if (performanceData[id]) return;

    try {
      setPerformanceLoading(id);

      const res = await fetch(`${API_BASE}/strategies/${id}/performance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setPerformanceData((prev) => ({ ...prev, [id]: data }));
      }
    } catch {
      // silently ignore, panel will just show no data
    } finally {
      setPerformanceLoading(null);
    }
  };

  const filteredStrategies = strategies.filter((item) => {
    const q = search.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.targetAudience?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All" ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: strategies.length,
    planned: strategies.filter((s) => s.status === "Planned").length,
    active: strategies.filter((s) => s.status === "Active").length,
    completed: strategies.filter((s) => s.status === "Completed").length,
    budget: strategies.reduce((sum, s) => sum + Number(s.budget || 0), 0),
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
        <MarketingSidebar />


        <main className="min-w-0 flex-1 px-4 py-6 md:h-screen md:overflow-y-auto md:px-6 lg:px-8">

          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80">
                  Marketing Strategy Maker
                </p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                  Create and manage marketing strategies
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Build campaign plans, track their status, and keep everything
                  organized inside CryptoSence.
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                <StatBox label="Total" value={stats.total} />
                <StatBox label="Planned" value={stats.planned} />
                <StatBox label="Active" value={stats.active} />
                <StatBox
                  label="Budget"
                  value={`PKR ${stats.budget.toLocaleString()}`}
                />
              </div>
            </div>

            {(message || error) && (
              <div
                className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                  error
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                }`}
              >
                {error || message}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(340px,0.8fr)_minmax(0,1.2fr)]">
              <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      {editingId ? "Edit Strategy" : "Create Strategy"}
                    </h2>
                    <p className="text-sm text-slate-400">
                      Use the same clean design as the rest of CryptoSence.
                    </p>
                  </div>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                    <InputField
                      label="Strategy Title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Example: Ramadan Growth Campaign"
                    />

                    <InputField
                      label="Target Audience"
                      name="targetAudience"
                      value={form.targetAudience}
                      onChange={handleChange}
                      placeholder="Example: Crypto beginners"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                    <InputField
                      label="Budget (PKR)"
                      name="budget"
                      type="number"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="Example: 1000 PKR"
                    />

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
                      >
                        <option value="Planned">Planned</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Write campaign goals, channels, timeline, and expected results..."
                      className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-[#06101f] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                        ? "Update Strategy"
                        : "Save Strategy"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <MiniStat label="Completed" value={stats.completed} />
                  <MiniStat
                    label="Budget"
                    value={`PKR ${stats.budget.toLocaleString()}`}
                  />
                  <MiniStat label="Total Plans" value={stats.total} />
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Strategy List</h2>
                    <p className="text-sm text-slate-400">
                      Search, filter, edit, and delete saved strategies.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["All", "Planned", "Active", "Completed"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setStatusFilter(item)}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                          statusFilter === item
                            ? "border border-cyan-400/20 bg-cyan-500/15 text-cyan-300"
                            : "border border-white/10 text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search strategy..."
                    className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
                  />
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-[#050b16] p-6 text-sm text-slate-400">
                    Loading strategies...
                  </div>
                ) : filteredStrategies.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#050b16] p-10 text-center text-sm text-slate-400">
                    No strategies found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStrategies.map((strategy) => (
                      <article
                        key={strategy._id}
                        className="rounded-3xl border border-white/10 bg-[#050b16] p-5 transition hover:border-cyan-400/20 hover:bg-[#07101f]"
                      >
                        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-words text-lg font-semibold text-white">
                                {strategy.title}
                              </h3>
                              <Badge status={strategy.status} />
                            </div>

                            <p className="whitespace-pre-wrap break-words text-sm text-slate-400">
                              {strategy.description}
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 break-words text-xs text-slate-500">
                              <span>
                                Audience:{" "}
                                <span className="text-slate-300">
                                  {strategy.targetAudience}
                                </span>
                              </span>
                              <span>
                                Budget:{" "}
                                <span className="text-slate-300">
                                  PKR {Number(strategy.budget || 0).toLocaleString()}
                                </span>
                              </span>
                              <span>
                                Created:{" "}
                                <span className="text-slate-300">
                                  {strategy.createdAt
                                    ? new Date(strategy.createdAt).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 2xl:shrink-0">
                            <button
                              onClick={() => togglePerformance(strategy._id)}
                              className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                            >
                              {expandedId === strategy._id ? "Hide" : "View"} Performance
                            </button>

                            <button
                              onClick={() => handleEdit(strategy)}
                              className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(strategy._id)}
                              className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {expandedId === strategy._id && (
                          <div className="mt-4 rounded-2xl border border-violet-400/10 bg-violet-500/5 p-4">
                            {performanceLoading === strategy._id ? (
                              <p className="text-sm text-slate-400">Loading performance...</p>
                            ) : performanceData[strategy._id] ? (
                              <>
                                <p className="mb-3 text-xs text-slate-400">
                                  Aggregated from{" "}
                                  <span className="text-violet-300 font-medium">
                                    {performanceData[strategy._id].linkedGrowthCount}
                                  </span>{" "}
                                  linked Growth Tracking {performanceData[strategy._id].linkedGrowthCount === 1 ? "entry" : "entries"} and{" "}
                                  <span className="text-violet-300 font-medium">
                                    {performanceData[strategy._id].linkedMediaCount}
                                  </span>{" "}
                                  linked media {performanceData[strategy._id].linkedMediaCount === 1 ? "item" : "items"}.
                                </p>

                                {performanceData[strategy._id].linkedGrowthCount === 0 ? (
                                  <p className="text-sm text-slate-500">
                                    No Growth Tracking entries linked yet — go to Growth
                                    Tracking and select this strategy when logging results.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                                    <PerfStat label="Impressions" value={performanceData[strategy._id].totals.impressions} />
                                    <PerfStat label="Clicks" value={performanceData[strategy._id].totals.clicks} />
                                    <PerfStat label="Signups" value={performanceData[strategy._id].totals.signups} />
                                    <PerfStat label="Conversions" value={performanceData[strategy._id].totals.conversions} />
                                    <PerfStat label="CVR" value={`${performanceData[strategy._id].conversionRate}%`} />
                                    <PerfStat
                                      label="Revenue"
                                      value={`PKR ${Number(performanceData[strategy._id].totals.revenuePKR || 0).toLocaleString()}`}
                                    />
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-slate-500">
                                Unable to load performance data.
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
      />
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0b1220] px-3 py-3 sm:px-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-base font-bold text-white sm:text-lg">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function Badge({ status }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border";

  if (status === "Active") {
    return (
      <span
        className={`${base} border-emerald-400/20 bg-emerald-500/10 text-emerald-300`}
      >
        Active
      </span>
    );
  }

  if (status === "Completed") {
    return (
      <span
        className={`${base} border-violet-400/20 bg-violet-500/10 text-violet-300`}
      >
        Completed
      </span>
    );
  }

  return (
    <span
      className={`${base} border-yellow-400/20 bg-yellow-500/10 text-yellow-300`}
    >
      Planned
    </span>
  );
}

function PerfStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#050b16] px-3 py-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default MarketingStrategyMaker;
