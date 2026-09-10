import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "/admin-dashboard" },
    { name: "Subscription Detail", icon: "💳", path: "/admin-subscriptions" },
    { name: "Marketing Team", icon: "📈", path: "/admin-marketing" },
    { name: "Feedback", icon: "💬", path: "/admin-feedback" },
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
          <div className="leading-tight">
            <span className="block text-white font-bold text-sm">CryptoSence</span>
            <span className="block text-slate-400 text-[10px]">Admin Panel</span>
          </div>
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
        className={`fixed md:static top-0 left-0 z-50 h-full w-[230px] bg-[#070f1c] border-r border-white/5 flex flex-col justify-between px-4 py-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div>
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-3">
              <img src="/cryptosence.svg" alt="CryptoSence" className="w-11 h-11 rounded-xl" />
              <div>
                <h1 className="text-[19px] font-bold leading-none text-white">
                  CryptoSence
                </h1>
                <p className="text-[11px] text-slate-400 mt-1">Admin Panel</p>
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
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition border ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/15"
                      : "bg-transparent text-slate-300 border-transparent hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="text-sm w-5 text-center">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="bg-[#0d1727] border border-white/5 rounded-2xl p-4">
            <p className="text-[11px] text-slate-400">Logged in as</p>
            <h3 className="text-sm font-semibold text-white mt-1">
              {admin.username || admin.name || "Admin"}
            </h3>
            <p className="text-cyan-400 text-[11px] mt-2">
              {admin.email || "admin@cryptosence.com"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2a1420] text-[#ff6a6a] border border-[#4a2030] hover:bg-[#341824] transition"
          >
            <span className="text-sm">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;