import React, { useEffect, useMemo, useState } from "react";
import MarketingSidebar from "../components/MarketingSidebar";

const API_BASE = "http://localhost:5000/api/marketing";

const emptyForm = {
  title: "",
  strategy: "",
  channel: "Referral",
  date: "",
  impressions: "",
  clicks: "",
  signups: "",
  conversions: "",
  revenuePKR: "1000",
  status: "Running",
  notes: "",
};

function MarketingGrowthTracking() {
  const [entries, setEntries] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError("");

      const [entriesRes, summaryRes, strategiesRes] = await Promise.all([
        fetch(`${API_BASE}/growth`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/growth/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/strategies`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const entriesData = await entriesRes.json();
      const summaryData = await summaryRes.json();
      const strategiesData = await strategiesRes.json();

      if (!entriesRes.ok) {
        throw new Error(entriesData.message || "Failed to load growth entries");
      }

      if (!summaryRes.ok) {
        throw new Error(summaryData.message || "Failed to load summary");
      }

      setEntries(Array.isArray(entriesData) ? entriesData : []);
      setSummary(summaryData);
      setStrategies(Array.isArray(strategiesData) ? strategiesData : []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
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

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        title: form.title.trim(),
        strategy: form.strategy || null,
        channel: form.channel,
        date: form.date || undefined,
        impressions: Number(form.impressions || 0),
        clicks: Number(form.clicks || 0),
        signups: Number(form.signups || 0),
        conversions: Number(form.conversions || 0),
        revenuePKR: Number(form.revenuePKR || 0),
        status: form.status,
        notes: form.notes.trim(),
      };

      const url = editingId
        ? `${API_BASE}/growth/${editingId}`
        : `${API_BASE}/growth`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save entry");
      }

      setMessage(
        editingId
          ? "Growth entry updated successfully."
          : "Growth entry created successfully."
      );

      resetForm();
      fetchEntries();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      title: entry.title || "",
      strategy: entry.strategy?._id || entry.strategy || "",
      channel: entry.channel || "Referral",
      date: entry.date ? new Date(entry.date).toISOString().slice(0, 10) : "",
      impressions: entry.impressions?.toString?.() || "",
      clicks: entry.clicks?.toString?.() || "",
      signups: entry.signups?.toString?.() || "",
      conversions: entry.conversions?.toString?.() || "",
      revenuePKR: entry.revenuePKR?.toString?.() || "1000",
      status: entry.status || "Running",
      notes: entry.notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this growth entry?");
    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API_BASE}/growth/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("Growth entry deleted successfully.");
      fetchEntries();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  const filteredEntries = entries.filter((item) => {
    const q = search.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(q) ||
      item.channel?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q);

    const matchesChannel =
      channelFilter === "All" ? true : item.channel === channelFilter;

    const matchesStatus =
      statusFilter === "All" ? true : item.status === statusFilter;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const uiSummary = summary || {
    totalCampaigns: 0,
    impressions: 0,
    clicks: 0,
    signups: 0,
    conversions: 0,
    revenuePKR: 0,
    planned: 0,
    running: 0,
    paused: 0,
    completed: 0,
    clickThroughRate: "0.0",
    conversionRate: "0.0",
    signupRate: "0.0",
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <MarketingSidebar />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto min-w-0">
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80">
                  Growth Tracking
                </p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                  Track campaign growth and performance
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Record campaign results, measure engagement, and monitor conversions
                  in a simple marketing dashboard.
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                <StatBox label="Campaigns" value={uiSummary.totalCampaigns} />
                <StatBox label="Signups" value={uiSummary.signups} />
                <StatBox label="Conversions" value={uiSummary.conversions} />
                <StatBox
                  label="Revenue"
                  value={`PKR ${Number(uiSummary.revenuePKR || 0).toLocaleString()}`}
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

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      {editingId ? "Edit Growth Entry" : "Create Growth Entry"}
                    </h2>
                    <p className="text-sm text-slate-400">
                      Store campaign results and keep your marketing data organized.
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Campaign Title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Example: Eid referral boost"
                    />

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Channel
                      </label>
                      <select
                        name="channel"
                        value={form.channel}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
                      >
                        <option value="Referral">Referral</option>
                        <option value="Social Media">Social Media</option>
                        <option value="SEO">SEO</option>
                        <option value="Email">Email</option>
                        <option value="Influencer">Influencer</option>
                        <option value="Ads">Ads</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Link to Strategy <span className="text-slate-500">(optional)</span>
                    </label>
                    <select
                      name="strategy"
                      value={form.strategy}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
                    >
                      <option value="">None — standalone entry</option>
                      {strategies.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.title} ({s.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                    <InputField
                      label="Impressions"
                      name="impressions"
                      type="number"
                      value={form.impressions}
                      onChange={handleChange}
                      placeholder="0"
                    />
                    <InputField
                      label="Clicks"
                      name="clicks"
                      type="number"
                      value={form.clicks}
                      onChange={handleChange}
                      placeholder="0"
                    />
                    <InputField
                      label="Signups"
                      name="signups"
                      type="number"
                      value={form.signups}
                      onChange={handleChange}
                      placeholder="0"
                    />
                    <InputField
                      label="Conversions"
                      name="conversions"
                      type="number"
                      value={form.conversions}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Revenue (PKR)"
                      name="revenuePKR"
                      type="number"
                      value={form.revenuePKR}
                      onChange={handleChange}
                      placeholder="1000"
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
                        <option value="Running">Running</option>
                        <option value="Paused">Paused</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <InputField
                      label="Date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Write campaign notes, observations, and next steps..."
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
                        ? "Update Entry"
                        : "Save Entry"}
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
                  <MiniStat label="CTR" value={`${uiSummary.clickThroughRate}%`} />
                  <MiniStat label="CVR" value={`${uiSummary.conversionRate}%`} />
                  <MiniStat label="Signup Rate" value={`${uiSummary.signupRate}%`} />
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                <div className="mb-4 flex flex-col gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Growth Entries</h2>
                    <p className="text-sm text-slate-400">
                      Search, filter, edit, and delete campaign records.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["All", "Referral", "Social Media", "SEO", "Email", "Influencer", "Ads", "Other"].map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() => setChannelFilter(item)}
                          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                            channelFilter === item
                              ? "border border-cyan-400/20 bg-cyan-500/15 text-cyan-300"
                              : "border border-white/10 text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {["All", "Planned", "Running", "Paused", "Completed"].map((item) => (
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

                <div className="mb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search growth entries..."
                    className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
                  />
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-[#050b16] p-6 text-sm text-slate-400">
                    Loading growth entries...
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#050b16] p-10 text-center text-sm text-slate-400">
                    No growth entries found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEntries.map((entry) => (
                      <article
                        key={entry._id}
                        className="rounded-3xl border border-white/10 bg-[#050b16] p-5 transition hover:border-cyan-400/20 hover:bg-[#07101f]"
                      >
                        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-words text-lg font-semibold text-white">
                                {entry.title}
                              </h3>
                              <Badge status={entry.status} />
                              <ChannelBadge channel={entry.channel} />
                              {entry.strategy && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                                  🔗 {entry.strategy.title || "Linked Strategy"}
                                </span>
                              )}
                            </div>

                            <p className="whitespace-pre-wrap break-words text-sm text-slate-400">
                              {entry.notes || "No notes added."}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 2xl:grid-cols-3">
                              <InfoItem label="Impressions" value={entry.impressions} />
                              <InfoItem label="Clicks" value={entry.clicks} />
                              <InfoItem label="Signups" value={entry.signups} />
                              <InfoItem label="Conversions" value={entry.conversions} />
                              <InfoItem
                                label="Revenue"
                                value={`PKR ${Number(entry.revenuePKR || 0).toLocaleString()}`}
                              />
                              <InfoItem
                                label="Date"
                                value={
                                  entry.date
                                    ? new Date(entry.date).toLocaleDateString()
                                    : "N/A"
                                }
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 2xl:shrink-0">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="flex-1 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 sm:flex-none"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(entry._id)}
                              className="flex-1 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 sm:flex-none"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
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

  if (status === "Running") {
    return (
      <span className={`${base} border-emerald-400/20 bg-emerald-500/10 text-emerald-300`}>
        Running
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

  if (status === "Paused") {
    return (
      <span className={`${base} border-yellow-400/20 bg-yellow-500/10 text-yellow-300`}>
        Paused
      </span>
    );
  }

  return (
    <span className={`${base} border-slate-400/20 bg-slate-500/10 text-slate-300`}>
      Planned
    </span>
  );
}

function ChannelBadge({ channel }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
      {channel}
    </span>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0b1220] px-3 py-3">
      <p className="break-words text-[11px] leading-4 text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default MarketingGrowthTracking;
