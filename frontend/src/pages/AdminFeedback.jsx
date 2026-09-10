import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/admin/feedback", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch feedback");
      }

      setFeedback(data.feedback);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const deleteFeedback = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this feedback?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/feedback/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete feedback");
      }

      setMessage(data.message);
      fetchFeedback();
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
            <h1 className="text-3xl font-bold">Feedback Management</h1>
            <p className="text-sm text-slate-400">View and manage user feedback</p>
          </div>

          {message && (
            <div className="mb-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20 px-4 py-3 text-cyan-300">
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-slate-400">Loading feedback...</p>
          ) : feedback.length === 0 ? (
            <p className="text-slate-400">No feedback available.</p>
          ) : (
            <div className="grid gap-4">
              {feedback.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-white/10 bg-[#050b16] p-5"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-slate-400 text-sm">Name</p>
                      <p className="font-semibold">{item.name}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <p className="font-semibold">{item.email}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-slate-400 text-sm mb-1">Message</p>
                    <p className="text-slate-200 leading-7">{item.message}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => deleteFeedback(item._id)}
                      className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-slate-500">
                    Submitted: {new Date(item.createdAt).toLocaleString()}
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

export default AdminFeedback;