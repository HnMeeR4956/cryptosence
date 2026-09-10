import React, { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

const API_BASE = "http://localhost:5000/api/admin";

function AdminSubscriptions() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isActive = (status) => status === "active";

  const activeCount = users.filter((u) => isActive(u.subscriptionStatus)).length;
  const inactiveCount = users.length - activeCount;

  const filteredUsers = useMemo(() => {
    if (filter === "Active") return users.filter((u) => isActive(u.subscriptionStatus));
    if (filter === "Inactive") return users.filter((u) => !isActive(u.subscriptionStatus));
    return users;
  }, [users, filter]);

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="bg-[#0b1220] border border-white/10 rounded-2xl p-5 md:p-6 shadow-lg">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Subscription Detail</h1>
            <p className="text-sm text-slate-400 mt-1">
              See which users have an active Premium subscription and which
              don't.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-slate-400 text-sm">Active Subscriptions</p>
              <p className="text-3xl font-bold mt-1 text-emerald-400">
                {loading ? "—" : activeCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-slate-400 text-sm">Inactive</p>
              <p className="text-3xl font-bold mt-1 text-slate-300">
                {loading ? "—" : inactiveCount}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 col-span-2 md:col-span-1">
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold mt-1 text-cyan-400">
                {loading ? "—" : users.length}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {["All", "Active", "Inactive"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === f
                    ? "bg-cyan-500 text-[#050b16]"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {message && (
            <div className="mb-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20 px-4 py-3 text-cyan-300">
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-slate-400">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-slate-400">No users found for this filter.</p>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => {
                const active = isActive(user.subscriptionStatus);

                return (
                  <div
                    key={user._id}
                    className={`rounded-2xl border p-5 ${
                      active
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-white/10 bg-[#050b16]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="grid gap-3 sm:grid-cols-2 flex-1">
                        <div>
                          <p className="text-slate-400 text-sm">Name</p>
                          <p className="font-semibold">{user.username}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Email</p>
                          <p className="font-semibold">{user.email}</p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${
                          active
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-slate-400 border border-white/10"
                        }`}
                      >
                        {active ? "● Active" : "○ Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Subscription Status</p>
                        <p
                          className={`font-semibold mt-1 ${
                            active ? "text-emerald-400" : "text-slate-400"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Account Status</p>
                        <p
                          className={`font-medium mt-1 ${
                            user.isBlocked ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminSubscriptions;