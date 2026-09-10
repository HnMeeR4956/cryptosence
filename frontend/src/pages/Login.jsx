import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      if (role === "admin") navigate("/admin-dashboard", { replace: true });
      else if (role === "marketing") navigate("/marketing-dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://cryptosence.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (data.user.role === "marketing") {
        navigate("/marketing-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b16] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/cryptosence.svg"
              alt="CryptoSence"
              className="w-12 h-12 rounded-2xl"
            />
            <h1 className="text-white text-4xl font-bold">CryptoSence</h1>
          </div>
          <p className="text-slate-400 mt-2">Login to your account</p>
        </div>

        <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-8">
          <form onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full bg-[#111c2d] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-[#111c2d] border border-white/5 rounded-2xl px-4 py-3 pr-12 text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 4 10 7-.36 1.13-1.07 2.34-2.06 3.44M6.6 6.6C4.4 8.06 2.85 10.09 2 12c1 3 5 7 10 7 1.34 0 2.6-.28 3.75-.78"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-cyan-400 text-sm hover:text-cyan-300"
                >
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3 rounded-2xl transition ${
                  loading
                    ? "bg-slate-600 text-white cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-400 text-[#050b16]"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-slate-400 text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            © 2026 CryptoSence. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;