import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Feedback() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) return;

    if (user?.username || user?.email) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    setStatus("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus("Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.message || "Failed to submit feedback.");
        return;
      }

      setStatus("Feedback submitted successfully.");
      setFormData((prev) => ({
        ...prev,
        message: "",
      }));
    } catch (error) {
      setStatus("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto min-w-0">
        <main className="flex-1 px-4 py-4">
          <div className="max-w-[1180px] mx-auto">
            <div className="bg-[#0d1727] border border-white/5 rounded-3xl px-6 py-12 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Feedback
              </h1>
              <p className="text-slate-400 mt-4 max-w-3xl mx-auto leading-7">
                Share your opinion, suggestions, or issues about CryptoSence.
                Your feedback helps us improve the platform for all users.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 mt-6">
              <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6">
                <h2 className="text-2xl font-bold mb-6">Send Your Feedback</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full bg-[#111c2d] border border-white/5 rounded-2xl px-4 py-3 outline-none text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full bg-[#111c2d] border border-white/5 rounded-2xl px-4 py-3 outline-none text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="7"
                      placeholder="Write your feedback here..."
                      className="w-full bg-[#111c2d] border border-white/5 rounded-2xl px-4 py-3 outline-none text-white placeholder:text-slate-500 resize-none"
                    />
                  </div>

                  {status && (
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm border ${
                        status.toLowerCase().includes("success")
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-300"
                      }`}
                    >
                      {status}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 transition rounded-2xl py-3.5 text-sm font-medium"
                  >
                    {loading ? "Submitting..." : "Submit Feedback"}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4">Why Feedback Matters</h3>
                  <p className="text-slate-400 leading-7 text-sm">
                    Feedback helps improve dashboard design, coin data display,
                    chatbot responses, learning resources, and system usability.
                  </p>
                </div>

                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4">Contact Details</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-slate-400">Support Email</p>
                      <p className="text-white mt-1">support@cryptosence.com</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Location</p>
                      <p className="text-white mt-1">Lahore, Pakistan</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Response Time</p>
                      <p className="text-white mt-1">Within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4">Feedback Tips</h3>
                  <ul className="space-y-3 text-sm text-slate-400 leading-6">
                    <li>• Mention the page or feature you used.</li>
                    <li>• Describe any bug or confusion clearly.</li>
                    <li>• Share suggestions for improvement.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default Feedback;