import React, { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setMessage(data.message || "Reset link sent to your email.");
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b16] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0d1727] border border-white/5 rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white text-center">Forgot Password</h1>
        <p className="text-slate-400 text-sm text-center mt-2">
          Enter your registered email and we will send a reset link.
        </p>

        {message && (
          <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-[#050b16] border border-white/10 px-4 py-3 text-white outline-none focus:border-cyan-500"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 transition rounded-2xl py-3 text-sm font-medium text-white"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-5 text-sm text-slate-400">
          Remember your password?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
export default ForgotPassword;
