import React, { useEffect, useMemo, useState } from "react";
import MarketingSidebar from "../components/MarketingSidebar";

const API_BASE = "http://localhost:5000/api/marketing";

const emptyForm = {
  title: "",
  strategy: "",
  description: "",
  mediaType: "Image",
  externalLink: "",
  tags: "",
  status: "Draft",
  mediaFile: null,
};

function MarketingMediaUploads() {
  const [items, setItems] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/media`, {
        headers: authHeaders,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load media items");
      }

      setItems(Array.isArray(data) ? data : []);

      const strategiesRes = await fetch(`${API_BASE}/strategies`, {
        headers: authHeaders,
      });
      const strategiesData = await strategiesRes.json();
      if (strategiesRes.ok) {
        setStrategies(Array.isArray(strategiesData) ? strategiesData : []);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "mediaFile") {
      setForm((prev) => ({
        ...prev,
        mediaFile: files[0] || null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
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

      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("strategy", form.strategy || "");
      data.append("description", form.description.trim());
      data.append("mediaType", form.mediaType);
      data.append("externalLink", form.externalLink.trim());
      data.append("tags", form.tags.trim());
      data.append("status", form.status);

      if (form.mediaFile) {
        data.append("mediaFile", form.mediaFile);
      }

      const res = await fetch(`${API_BASE}/media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Upload failed");
      }

      setMessage("Media uploaded successfully.");
      resetForm();
      fetchItems();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this media item?");
    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API_BASE}/media/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Delete failed");
      }

      setMessage("Media deleted successfully.");
      fetchItems();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.tags?.join(" ").toLowerCase().includes(q);

    const matchesType =
      typeFilter === "All" ? true : item.mediaType === typeFilter;

    const matchesStatus =
      statusFilter === "All" ? true : item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: items.length,
    images: items.filter((i) => i.mediaType === "Image").length,
    videos: items.filter((i) => i.mediaType === "Video").length,
    documents: items.filter((i) => i.mediaType === "Document").length,
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
                  Media Uploads
                </p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                  Upload and manage campaign media
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Add images, videos, PDFs, and external links for your marketing library.
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                <StatBox label="Total" value={stats.total} />
                <StatBox label="Images" value={stats.images} />
                <StatBox label="Videos" value={stats.videos} />
                <StatBox label="Docs" value={stats.documents} />
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

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                <div className="mb-5">
                  <h2 className="text-xl font-bold">Upload New Media</h2>
                  <p className="text-sm text-slate-400">
                    Keep media organized for marketing campaigns and strategy posts.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <InputField
                      label="Title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Example: Instagram post creative"
                    />

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
                        <option value="">None — standalone asset</option>
                        {strategies.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.title} ({s.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Media Type
                      </label>
                      <select
                        name="mediaType"
                        value={form.mediaType}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
                      >
                        <option value="Image">Image</option>
                        <option value="Video">Video</option>
                        <option value="Document">Document</option>
                        <option value="Link">Link</option>
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
                      rows={4}
                      placeholder="Write media usage details, campaign context, or notes..."
                      className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <InputField
                      label="External Link"
                      name="externalLink"
                      value={form.externalLink}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />

                    <InputField
                      label="Tags"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="campaign,ads,instagram"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Upload File
                      </label>
                      <input
                        type="file"
                        name="mediaFile"
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#06101f] hover:file:bg-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-[#06101f] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Uploading..." : "Upload Media"}
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
              </section>

              <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/30">
                <div className="mb-4 flex flex-col gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Media Library</h2>
                    <p className="text-sm text-slate-400">
                      Search, filter, preview, and delete uploaded files.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["All", "Image", "Video", "Document", "Link"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setTypeFilter(item)}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                          typeFilter === item
                            ? "border border-cyan-400/20 bg-cyan-500/15 text-cyan-300"
                            : "border border-white/10 text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {["All", "Draft", "Published", "Archived"].map((item) => (
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
                    placeholder="Search media..."
                    className="w-full rounded-2xl border border-white/10 bg-[#050b16] px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
                  />
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-[#050b16] p-6 text-sm text-slate-400">
                    Loading media...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#050b16] p-10 text-center text-sm text-slate-400">
                    No media items found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map((item) => (
                      <article
                        key={item._id}
                        className="rounded-3xl border border-white/10 bg-[#050b16] p-5 transition hover:border-cyan-400/20 hover:bg-[#07101f]"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="break-words text-lg font-semibold text-white">
                                {item.title}
                              </h3>
                              <p className="mt-1 text-sm text-slate-400">
                                {item.description || "No description added."}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge status={item.status} />
                              <TypeBadge type={item.mediaType} />
                            </div>
                          </div>

                          <div className="grid gap-4 2xl:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]">
                              {renderPreview(item)}
                            </div>

                            <div className="min-w-0 space-y-3">
                              <div className="grid gap-2 break-words text-sm text-slate-400">
                                <p>
                                  <span className="text-slate-500">File:</span>{" "}
                                  {item.fileName || "N/A"}
                                </p>
                                <p>
                                  <span className="text-slate-500">Tags:</span>{" "}
                                  {item.tags?.length ? item.tags.join(", ") : "None"}
                                </p>
                                <p>
                                  <span className="text-slate-500">Created:</span>{" "}
                                  {item.createdAt
                                    ? new Date(item.createdAt).toLocaleString()
                                    : "N/A"}
                                </p>
                                <p>
                                  <span className="text-slate-500">By:</span>{" "}
                                  {item.createdBy?.username || "Unknown"}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                {item.fileUrl && (
                                  <a
                                    href={`http://localhost:5000${item.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                                  >
                                    Open File
                                  </a>
                                )}

                                {item.externalLink && (
                                  <a
                                    href={item.externalLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                                  >
                                    External Link
                                  </a>
                                )}

                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
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

function renderPreview(item) {
  const url = item.fileUrl ? `http://localhost:5000${item.fileUrl}` : "";

  if (item.mediaType === "Image" && url) {
    return <img src={url} alt={item.title} className="h-56 w-full object-cover" />;
  }

  if (item.mediaType === "Video" && url) {
    return (
      <video controls className="h-56 w-full bg-black object-cover">
        <source src={url} />
      </video>
    );
  }

  if (item.mediaType === "Document" && url) {
    return (
      <div className="flex h-56 items-center justify-center px-4 text-center">
        <div>
          <p className="text-sm font-semibold text-white">Document</p>
          <p className="mt-2 text-xs text-slate-400">PDF or document uploaded</p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300"
          >
            View Document
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-56 items-center justify-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold text-white">Link Item</p>
        <p className="mt-2 text-xs text-slate-400">
          External media link or resource
        </p>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>
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

function Badge({ status }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border";

  if (status === "Published") {
    return (
      <span className={`${base} border-emerald-400/20 bg-emerald-500/10 text-emerald-300`}>
        Published
      </span>
    );
  }

  if (status === "Archived") {
    return (
      <span className={`${base} border-violet-400/20 bg-violet-500/10 text-violet-300`}>
        Archived
      </span>
    );
  }

  return (
    <span className={`${base} border-yellow-400/20 bg-yellow-500/10 text-yellow-300`}>
      Draft
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
      {type}
    </span>
  );
}

export default MarketingMediaUploads;
