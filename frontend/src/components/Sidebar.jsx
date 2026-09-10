import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "/dashboard" },
    { name: "Cryptobot", icon: "🤖", path: "/cryptobot" },
    { name: "Learning Hub", icon: "📚", path: "/learninghub" },
    { name: "Feedback", icon: "💬", path: "/feedback" },
    { name: "Subscription", icon: "⭐", path: "/subscription" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#070f1c] border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="/cryptosence.svg" alt="CryptoSence" className="w-8 h-8 rounded-xl" />
          <span className="text-white font-bold text-sm">CryptoSence</span>
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111c2d] border border-white/10 text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Backdrop overlay (mobile only, shown when drawer is open) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel: off-canvas drawer on mobile, static column on desktop */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-full w-[210px] bg-[#070f1c] border-r border-white/5 flex flex-col justify-between px-3 py-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div>
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-3">
              <img src="/cryptosence.svg" alt="CryptoSence" className="w-10 h-10 rounded-xl" />
              <div>
                <h1 className="text-white text-lg font-bold">CryptoSence</h1>
                <p className="text-slate-400 text-xs">User Portal</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition border ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                      : "text-slate-300 border-transparent hover:bg-white/5"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="bg-[#0d1727] border border-white/5 rounded-2xl p-3">
            <p className="text-xs text-slate-400">Logged in as</p>
            <h3 className="text-white font-semibold">
              {user.username || user.name || "User"}
            </h3>
            <p className="text-cyan-400 text-xs">
              {user.email || "user@gmail.com"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;