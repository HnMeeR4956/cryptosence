import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050b16] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_35%),radial-gradient(circle_at_center,_rgba(16,185,129,0.08),_transparent_40%)]" />

      <div className="relative">
        <section className="px-4 pt-10">
          <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] border border-white/5 bg-[#0d1727] px-6 py-12 shadow-2xl shadow-black/30 sm:px-10 sm:py-16">
            {/* Decorative background: grid + candlestick chart silhouette */}
            <div className="pointer-events-none absolute inset-0">
              <svg
                className="absolute inset-0 h-full w-full opacity-[0.07]"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.15" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>

              <svg
                className="absolute bottom-0 left-0 h-[65%] w-full opacity-30 sm:opacity-40"
                viewBox="0 0 1200 300"
                preserveAspectRatio="none"
                fill="none"
              >
                <defs>
                  <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d="M0,220 L60,205 L120,215 L180,180 L240,190 L300,150 L360,165 L420,120 L480,140 L540,100 L600,125 L660,90 L720,110 L780,70 L840,95 L900,60 L960,80 L1020,45 L1080,65 L1140,35 L1200,55"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M0,220 L60,205 L120,215 L180,180 L240,190 L300,150 L360,165 L420,120 L480,140 L540,100 L600,125 L660,90 L720,110 L780,70 L840,95 L900,60 L960,80 L1020,45 L1080,65 L1140,35 L1200,55 L1200,300 L0,300 Z"
                  fill="url(#chartFade)"
                />

                {[
                  [40, 180, 232, "#22d3ee"],
                  [160, 160, 250, "#10b981"],
                  [280, 130, 210, "#22d3ee"],
                  [400, 100, 220, "#10b981"],
                  [520, 90, 190, "#22d3ee"],
                  [640, 70, 200, "#10b981"],
                  [760, 55, 170, "#22d3ee"],
                  [880, 45, 180, "#10b981"],
                  [1000, 30, 160, "#22d3ee"],
                  [1120, 25, 150, "#10b981"],
                ].map(([x, y1, y2, color], i) => (
                  <line
                    key={i}
                    x1={x}
                    y1={y1}
                    x2={x}
                    y2={y2}
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                ))}
              </svg>
            </div>

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/15 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Crypto Dashboard & Chatbot
              </div>

              <h1 className="mt-8 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Track crypto prices with{" "}
                <span className="text-cyan-400">CryptoSence</span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Live prices and charts for the top 100 coins, a chatbot that
                gives quick BUY/SELL/HOLD predictions, a learning section with
                trading resources, and a place to send feedback — all in one
                account.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-2xl bg-cyan-400 px-7 py-3.5 font-semibold text-[#050b16] shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300"
                >
                  Create an account
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="rounded-2xl border border-white/10 bg-white/5 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
                >
                  Login
                </button>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { title: "Live", subtitle: "PRICE DATA" },
                  { title: "Chatbot", subtitle: "CRYPTOBOT" },
                  { title: "Guides", subtitle: "LEARNING HUB" },
                  { title: "Accounts", subtitle: "USER LOGIN" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/5 bg-white/5 px-4 py-5 text-center"
                  >
                    <div className="text-lg font-bold text-cyan-300">
                      {item.title}
                    </div>
                    <div className="mt-1 text-[11px] tracking-[0.18em] text-slate-400">
                      {item.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 mt-14">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
                Features
              </div>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                What's in CryptoSence
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                A dashboard for checking prices, a chatbot for quick questions,
                and a couple of pages to help you learn and give feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="flex flex-col gap-5 rounded-[22px] border border-white/5 bg-[#0d1727] p-5 sm:p-6 md:flex-row">
                <div className="flex-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/10 bg-cyan-500/10 text-cyan-300">
                    📈
                  </div>
                  <h3 className="mt-5 text-2xl font-bold">
                    Live Price Dashboard
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Prices, 24h change, market cap, and volume for the top 100
                    coins, pulled from CoinGecko.
                  </p>

                  <ul className="mt-5 space-y-2 text-sm text-slate-300">
                    <li>✓ Updated market data</li>
                    <li>✓ Price chart for each coin</li>
                    <li>✓ Search by name or symbol</li>
                  </ul>
                </div>

                <div className="flex flex-1 items-center justify-center rounded-[20px] border border-white/5 bg-[#101a2b] p-4">
                  <div className="w-full max-w-[260px] rounded-3xl border border-white/5 bg-[#0c1322] p-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>BTC / USD</span>
                      <span>Live</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[72%] rounded-full bg-cyan-400" />
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[55%] rounded-full bg-emerald-400" />
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[80%] rounded-full bg-cyan-300" />
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[68%] rounded-full bg-emerald-300" />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      {["Price", "Volume", "Trend"].map((t) => (
                        <div
                          key={t}
                          className="rounded-xl border border-white/5 bg-white/5 py-2 text-center text-slate-400"
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/5 bg-[#0d1727] p-5 sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/10 bg-purple-500/10 text-purple-300">
                  🤖
                </div>
                <h3 className="mt-5 text-2xl font-bold">Cryptobot</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Type in a coin symbol and get a short BUY, SELL, or HOLD
                  prediction with a reason and a risk note.
                </p>

                <div className="mt-6 rounded-2xl border border-white/5 bg-[#101a2b] p-4">
                  <div className="text-sm italic text-slate-400">
                    "ETH"
                  </div>
                  <div className="mt-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    HOLD — price is range-bound this week, low volatility
                    expected.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/5 bg-[#0d1727] p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-500/10 bg-pink-500/10 text-pink-300">
                🧩
              </div>

              <h3 className="mt-5 text-2xl font-bold">Learning Hub & Feedback</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                A small library of trading and investing resources, plus a
                feedback page so users can report issues or suggest changes.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[18px] border border-white/5 bg-[#101a2b] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/10 bg-cyan-500/10 text-cyan-300">
                    📚
                  </div>
                  <h4 className="mt-4 text-lg font-bold">Learning Hub</h4>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Book recommendations and reading material on trading
                    psychology and technical analysis.
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/5 bg-[#101a2b] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/10 bg-indigo-500/10 text-indigo-300">
                    💬
                  </div>
                  <h4 className="mt-4 text-lg font-bold">Feedback</h4>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Send a message directly to the team if something's not
                    working or you have an idea.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/5 bg-[#0d1727] p-8 text-center sm:p-10">
              <h3 className="text-3xl font-extrabold">
                Try it out
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Sign up for a free account to check live prices and try the
                chatbot.
              </p>

              <button
                onClick={() => navigate("/register")}
                className="mt-6 rounded-2xl bg-cyan-400 px-7 py-3.5 font-semibold text-[#050b16] transition hover:bg-cyan-300"
              >
                Create an account
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0b1220] px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src="/cryptosence.svg"
                  alt="CryptoSence"
                  className="h-10 w-10 rounded-2xl"
                />
                <div>
                  <div className="font-semibold leading-none">CryptoSence</div>
                  <div className="mt-1 text-xs text-slate-500">
                    A crypto tracking project
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#050b16] transition hover:bg-cyan-300"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;