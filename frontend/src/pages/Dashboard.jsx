import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
const BASE_URL =
  import.meta.env.VITE_COINGECKO_BASE_URL ||
  "https://api.coingecko.com/api/v3";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [timeRange, setTimeRange] = useState("24H");

  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  const perPage = 10;

  const cgHeaders = useMemo(() => {
    if (!API_KEY) return {};
    return {
      "x-cg-demo-api-key": API_KEY,
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (role && role !== "user") {
      if (role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "marketing") {
        navigate("/marketing-dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setSubscriptionStatus(data.user.subscriptionStatus || "inactive");
        }
      } catch {
        setSubscriptionStatus("inactive");
      }
    };

    loadProfile();
  }, [navigate]);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
          {
            headers: cgHeaders,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch coins");
        }

        const data = await response.json();
        setCoins(data);
        setSelectedCoin(data[0] || null);
      } catch (error) {
        console.log(error);
        setCoins([]);
        setSelectedCoin(null);
      } finally {
        setLoading(false);
      }
    };

    loadCoins();
  }, [BASE_URL, cgHeaders]);

  useEffect(() => {
    const loadChart = async () => {
      if (!selectedCoin?.id) return;

      try {
        setChartLoading(true);

        const days = timeRange === "24H" ? 1 : 7;

        const response = await fetch(
          `${BASE_URL}/coins/${selectedCoin.id}/market_chart?vs_currency=usd&days=${days}`,
          {
            headers: cgHeaders,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chart");
        }

        const data = await response.json();

        const labels = data.prices.map((item) => {
          const date = new Date(item[0]);
          if (days === 1) {
            return `${date.getHours().toString().padStart(2, "0")}:00`;
          }
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        const prices = data.prices.map((item) => item[1]);

        setChartData({
          labels,
          datasets: [
            {
              label: selectedCoin.name,
              data: prices,
              borderColor: "#22d3ee",
              backgroundColor: "rgba(34, 211, 238, 0.18)",
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 2,
            },
          ],
        });
      } catch (error) {
        console.log(error);
        setChartData(null);
      } finally {
        setChartLoading(false);
      }
    };

    loadChart();
  }, [selectedCoin, timeRange, BASE_URL, cgHeaders]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredCoins = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return coins;

    return coins.filter((coin) => {
      const name = (coin?.name || "").toLowerCase();
      const symbol = (coin?.symbol || "").toLowerCase();
      return name.includes(query) || symbol.includes(query);
    });
  }, [coins, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCoins.length / perPage));

  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return filteredCoins.slice(0, 8);
  }, [filteredCoins, search]);
  const isPro = true; // Dashboard is now fully accessible without a subscription
  const effectivePage = isPro ? page : 1;
  const paginatedCoins = filteredCoins.slice(
    (effectivePage - 1) * perPage,
    effectivePage * perPage
  );

  useEffect(() => {
    if (!isPro && page !== 1) {
      setPage(1);
    }
  }, [isPro, page]);

  useEffect(() => {
    if (filteredCoins.length && !selectedCoin) {
      setSelectedCoin(filteredCoins[0]);
    }
  }, [filteredCoins, selectedCoin]);

  const formatCompact = (value) => {
    if (value === null || value === undefined) return "-";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const selected = selectedCoin || coins[0];
  const price = selected?.current_price ?? 0;
  const change = selected?.price_change_percentage_24h ?? 0;
  const marketCap = selected?.market_cap ?? 0;
  const volume = selected?.total_volume ?? 0;
  const high24 = selected?.high_24h ?? 0;
  const low24 = selected?.low_24h ?? 0;
  const rank = selected?.market_cap_rank ?? "-";

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto min-w-0">
        <main className="flex-1 px-4 py-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome, {user?.username || user?.name || "User"}
                </h1>
                <p className="text-slate-400 mt-1">
                  {user?.email || "user@gmail.com"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <div className="bg-[#0d1727] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-slate-500 text-sm">🔎</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => setShowSearchDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSearchDropdown(false), 150)
                    }
                    placeholder="Search coin name or symbol..."
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                  />
                </div>

                {showSearchDropdown && search.trim() && (
                  <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1220] shadow-xl">
                    {searchSuggestions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No matching coin found.
                      </div>
                    ) : (
                      searchSuggestions.map((coin) => (
                        <button
                          key={coin.id}
                          type="button"
                          onMouseDown={() => {
                            setSelectedCoin(coin);
                            setSearch("");
                            setShowSearchDropdown(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition"
                        >
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {coin.name}
                            </div>
                            <div className="text-xs text-slate-500 uppercase">
                              {coin.symbol}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">
                            ${coin.current_price?.toLocaleString()}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="sm:shrink-0 px-4 py-3 rounded-2xl bg-[#0f2a1f] border border-emerald-500/15 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                <span className="text-[10px]">●</span>
                LIVE COIN DATA
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_240px] gap-4 mt-4">
              <div className="space-y-4">
                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Selected Coin</p>
                      <h2 className="text-3xl font-bold mt-1">
                        {selected?.name || "Bitcoin"}
                      </h2>
                      <p className="text-slate-400 text-sm mt-2">
                        {selected?.symbol?.toUpperCase() || "BTC"} - Live market
                        details from CoinGecko
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-3xl font-bold text-emerald-400">
                        {loading ? "..." : `$${price.toLocaleString()}`}
                      </div>
                      <div
                        className={`text-sm font-medium mt-1 ${
                          change < 0 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {loading
                          ? ""
                          : `${change >= 0 ? "+" : ""}${change.toFixed(2)}% ${
                              change < 0 ? "↓" : "↑"
                            }`}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0b1220] border border-white/5 rounded-3xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">Price Trend</h3>
                        <p className="text-slate-400 text-sm">
                          Market cap: {formatCompact(marketCap)} · Volume:{" "}
                          {formatCompact(volume)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTimeRange("24H")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                            timeRange === "24H"
                              ? "bg-slate-600 text-white"
                              : "bg-[#1b2638] text-slate-300"
                          }`}
                        >
                          24H
                        </button>
                        <button
                          onClick={() => setTimeRange("7D")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                            timeRange === "7D"
                              ? "bg-slate-600 text-white"
                              : "bg-[#1b2638] text-slate-300"
                          }`}
                        >
                          7D
                        </button>
                      </div>
                    </div>

                    <div className="h-[320px] rounded-2xl bg-[#0c1422] border border-white/5 p-3">
                      {chartLoading ? (
                        <div className="h-full flex items-center justify-center text-slate-400">
                          Loading chart...
                        </div>
                      ) : chartData ? (
                        <Line
                          data={chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: true },
                            },
                            scales: {
                              x: {
                                ticks: { color: "#94a3b8" },
                                grid: { color: "rgba(255,255,255,0.06)" },
                              },
                              y: {
                                ticks: { color: "#94a3b8" },
                                grid: { color: "rgba(255,255,255,0.06)" },
                              },
                            },
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                          Chart data not available
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-2xl font-bold">Top 100 Coins</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Live market list powered by CoinGecko.
                      </p>
                    </div>
                    <div className="text-slate-400 text-sm mt-2">
                      Page {page} of {totalPages}
                    </div>
                  </div>

                  <div className="overflow-x-auto mt-4">
                    <table className="w-full min-w-[860px] border-collapse">
                      <thead>
                        <tr className="text-slate-400 text-sm border-b border-white/5">
                          <th className="text-left py-4 font-medium w-16">No.</th>
                          <th className="text-left py-4 font-medium">Coin</th>
                          <th className="text-left py-4 font-medium">Price</th>
                          <th className="text-left py-4 font-medium">24h Change</th>
                          <th className="text-left py-4 font-medium">Market Cap</th>
                          <th className="text-left py-4 font-medium">Volume</th>
                          <th className="text-left py-4 font-medium w-28">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="py-10 text-slate-400 text-sm"
                            >
                              Loading live coin data...
                            </td>
                          </tr>
                        ) : (
                          paginatedCoins.map((coin, index) => {
                            const rowNo = (effectivePage - 1) * perPage + index + 1;
                            const isNegative =
                              coin.price_change_percentage_24h < 0;

                            return (
                              <tr
                                key={coin.id}
                                className="border-b border-white/5 hover:bg-white/2 transition cursor-pointer"
                                onClick={() => setSelectedCoin(coin)}
                              >
                                <td className="py-4">
                                  <div className="w-10 h-10 rounded-xl border border-[#1d2b43] flex items-center justify-center text-sm text-slate-300">
                                    {rowNo}
                                  </div>
                                </td>

                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={coin.image}
                                      alt={coin.name}
                                      className="w-9 h-9 rounded-full"
                                    />
                                    <div>
                                      <div className="font-semibold">
                                        {coin.name}
                                      </div>
                                      <div className="text-slate-400 text-xs uppercase">
                                        {coin.symbol}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4 text-sm font-medium">
                                  ${coin.current_price.toLocaleString()}
                                </td>

                                <td
                                  className={`py-4 text-sm font-medium ${
                                    isNegative
                                      ? "text-rose-400"
                                      : "text-emerald-400"
                                  }`}
                                >
                                  {coin.price_change_percentage_24h?.toFixed(
                                    2
                                  )}
                                  % {isNegative ? "↓" : "↑"}
                                </td>

                                <td className="py-4 text-sm font-medium">
                                  {formatCompact(coin.market_cap)}
                                </td>

                                <td className="py-4 text-sm font-medium">
                                  {formatCompact(coin.total_volume)}
                                </td>

                                <td className="py-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCoin(coin);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[#1f2e46] text-cyan-400 text-sm font-medium hover:bg-[#253954] transition"
                                  >
                                    Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={effectivePage === 1}
                      className="px-4 py-2 rounded-xl bg-[#0b1220] text-slate-400 disabled:opacity-40"
                    >
                      Prev
                    </button>

                    <div className="flex items-center gap-2 overflow-x-auto">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(0, 10)
                        .map((num) => {
                          const locked = !isPro && num > 1;
                          return (
                            <button
                              key={num}
                              onClick={() => {
                                if (locked) {
                                  navigate("/subscription");
                                  return;
                                }
                                setPage(num);
                              }}
                              className={`w-10 h-10 rounded-xl text-sm font-medium transition flex items-center justify-center ${
                                effectivePage === num
                                  ? "bg-cyan-500 text-[#07111f]"
                                  : locked
                                  ? "bg-[#0b1220] text-slate-600"
                                  : "bg-[#111c2d] text-slate-300 hover:bg-[#172538]"
                              }`}
                            >
                              {locked ? "🔒" : num}
                            </button>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => {
                        if (!isPro) {
                          navigate("/subscription");
                          return;
                        }
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                      disabled={isPro && effectivePage === totalPages}
                      className="px-4 py-2 rounded-xl bg-[#0b1220] text-slate-400 disabled:opacity-40"
                    >
                      {isPro ? "Next" : "🔒 Next"}
                    </button>
                  </div>

                  {!isPro && (
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3">
                      <div className="text-sm text-slate-300">
                        🔒 Free plan shows the top 10 coins only. Subscribe to
                        unlock all 100 coins.
                      </div>
                      <button
                        onClick={() => navigate("/subscription")}
                        className="shrink-0 px-4 py-2 rounded-xl bg-cyan-400 text-[#050b16] text-sm font-semibold hover:bg-cyan-300 transition"
                      >
                        Upgrade Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-4">
                  <h3 className="text-xl font-bold mb-4">Coin Details</h3>

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Market Cap</span>
                      <span className="font-semibold">
                        {formatCompact(marketCap)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">24h Volume</span>
                      <span className="font-semibold">
                        {formatCompact(volume)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">24h High</span>
                      <span className="font-semibold">
                        {selected ? `$${high24.toLocaleString()}` : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">24h Low</span>
                      <span className="font-semibold">
                        {selected ? `$${low24.toLocaleString()}` : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rank</span>
                      <span className="font-semibold">#{rank}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-4">
                  <h3 className="text-xl font-bold mb-3">Note</h3>
                  <p className="text-slate-400 text-sm leading-6">
                    {isPro
                      ? "Full plan: all 100 coins are available, 10 coins per page."
                      : "Free plan: only the top 10 coins are shown. Subscribe to unlock all 100 coins."}
                  </p>
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
export default Dashboard;