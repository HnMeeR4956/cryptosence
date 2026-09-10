import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

function AdminMarketingTeam() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");

  const fetchMarketingUsers = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("https://cryptosence.onrender.com/api/admin/marketing-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch marketing team");
      }

      setUsers(data.users);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingUsers();
  }, []);

  const createMarketingUser = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/admin/marketing-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create marketing user");
      }

      setMessage(data.message);
      setUsername("");
      setEmail("");
      setPassword("");
      fetchMarketingUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const blockUser = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/block`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Block failed");
      }

      setMessage(data.message);
      fetchMarketingUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const unblockUser = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/unblock`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unblock failed");
      }

      setMessage(data.message);
      fetchMarketingUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this marketing user?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage(data.message);
      fetchMarketingUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="bg-[#0b1220] border border-white/10 rounded-2xl p-5 md:p-6 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h1 className="text-3xl font-bold">Manage Marketing Team</h1>
            <p className="text-sm text-slate-400">Create and manage marketing users</p>
          </div>

          {message && (
            <div className="mb-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20 px-4 py-3 text-cyan-300">
              {message}
            </div>
          )}

          <div className="bg-[#050b16] border border-white/10 rounded-2xl p-5 mb-6">
            <h2 className="text-xl font-bold mb-4">Create Marketing User</h2>

            <form onSubmit={createMarketingUser} className="grid gap-4 md:grid-cols-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3 outline-none"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3 outline-none"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3 outline-none"
                required
              />

              <button
                type="submit"
                className="rounded-lg bg-cyan-600 px-4 py-3 font-semibold hover:bg-cyan-700"
              >
                Create User
              </button>
            </form>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading marketing users...</p>
          ) : users.length === 0 ? (
            <p className="text-slate-400">No marketing users found.</p>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="rounded-2xl border border-white/10 bg-[#050b16] p-5"
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-slate-400 text-sm">Name</p>
                      <p className="font-semibold">{user.username}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <p className="font-semibold">{user.email}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm">Role</p>
                      <p className="font-semibold capitalize">{user.role}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-slate-400 text-sm">Status</p>
                    <p className={`font-semibold ${user.isBlocked ? "text-red-400" : "text-green-400"}`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {!user.isBlocked ? (
                      <button
                        onClick={() => blockUser(user._id)}
                        className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium hover:bg-yellow-700"
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        onClick={() => unblockUser(user._id)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700"
                      >
                        Unblock
                      </button>
                    )}

                    <button
                      onClick={() => deleteUser(user._id)}
                      className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminMarketingTeam;