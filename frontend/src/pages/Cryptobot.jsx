import { API_BASE } from "../config/api";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const CG_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
const CG_BASE_URL =
  import.meta.env.VITE_COINGECKO_BASE_URL ||
  "https://api.coingecko.com/api/v3";
const FREE_DAILY_LIMIT = 5;

function Cryptobot() {
  const navigate = useNavigate();

  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState("");
  const [error, setError] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [usageCount, setUsageCount] = useState(0);
  const [coins, setCoins] = useState([]);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [predictedCoin, setPredictedCoin] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [indicators, setIndicators] = useState(null);
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);

  const isPro = subscriptionStatus === "active";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/predictions/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setSubscriptionStatus(data.subscriptionStatus || "inactive");
          setUsageCount(data.usageCount || 0);
        }
      } catch {
        setSubscriptionStatus("inactive");
      }
    };

    loadProfile();
    const timer = setInterval(loadProfile, 60000);
    window.addEventListener("focus", loadProfile);
    return () => { clearInterval(timer); window.removeEventListener("focus", loadProfile); };
  }, []);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        setCoinsLoading(true);
        const headers = CG_API_KEY ? { "x-cg-demo-api-key": CG_API_KEY } : {};

        const response = await fetch(
          `${CG_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
          { headers }
        );

        if (!response.ok) throw new Error("Failed to fetch coins");

        const data = await response.json();
        setCoins(data);
      } catch (err) {
        console.log(err);
        setCoins([]);
      } finally {
        setCoinsLoading(false);
      }
    };

    loadCoins();
  }, []);

  const matchingCoins = useMemo(() => {
    const query = symbol.trim().toLowerCase();
    if (!query) return coins.slice(0, 8);

    return coins
      .filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [coins, symbol]);

  const remaining = Math.max(0, FREE_DAILY_LIMIT - usageCount);
  const limitReached = !isPro && remaining <= 0;


  const parsedResult = useMemo(() => {
    const text = resultText.trim();
    if (!text) return null;


    // New Gemini responses use JSON. Keep the old text parser as a fallback
    // so previously returned predictions can still be displayed.
    try {
      const jsonText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      const parsed = JSON.parse(jsonText);
      const action = String(parsed.action || "").toUpperCase();
      const reason = String(parsed.reason || "").trim();
      const risk = String(parsed.risk || "").trim();

      if (["BUY", "SELL", "HOLD"].includes(action) && reason && risk) {
        return { action, reason, risk, raw: text };
      }
    } catch {
      // Continue with the legacy three-line parser below.
    }


    const cleanLine = (line) =>
      line
        .replace(/^\[|\]$/g, "") // strip leading "[" or trailing "]"
        .replace(/\[|\]/g, "") // strip any remaining brackets
        .replace(/\*\*/g, "") // strip markdown bold
        .replace(/^(Line \d+:|Prediction:|Reason:|Risk:)\s*/i, "") // strip leftover labels
        .trim();

    const lines = text
      .split("\n")
      .map((line) => cleanLine(line.trim()))
      .filter(Boolean);

    const actionLine = lines.find((line) =>
      /BUY|SELL|HOLD/i.test(line)
    );

    let action = "HOLD";
    if (actionLine) {
      if (/BUY/i.test(actionLine)) action = "BUY";
      else if (/SELL/i.test(actionLine)) action = "SELL";
      else if (/HOLD/i.test(actionLine)) action = "HOLD";
    }

    const actionIndex = actionLine ? lines.indexOf(actionLine) : -1;
    const reason = lines[actionIndex + 1] || "No complete reason was returned.";
    const risk = lines[actionIndex + 2] || "No complete risk note was returned.";

    return { action, reason, risk, raw: text };
  }, [resultText]);

  const getActionStyles = (action) => {
    if (action === "BUY") {
      return {
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        card: "border-emerald-500/20",
      };
    }

    if (action === "SELL") {
      return {
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        card: "border-rose-500/20",
      };
    }

    return {
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      card: "border-cyan-500/20",
    };
  };

  const handlePredict = async () => {
    if (loading) return;
    const query = symbol.trim();

    if (!query) {
      setError("Please select a coin from the list.");
      return;
    }

    const matched =
      selectedCoin &&
      (selectedCoin.symbol.toLowerCase() === query.toLowerCase() ||
        selectedCoin.name.toLowerCase() === query.toLowerCase())
        ? selectedCoin
        : coins.find(
            (coin) =>
              coin.symbol.toLowerCase() === query.toLowerCase() ||
              coin.name.toLowerCase() === query.toLowerCase()
          );

    if (!matched) {
      setError(
        "That coin isn't in the dashboard's top 100 list. Please pick one from the suggestions."
      );
      return;
    }


    if (limitReached) {
      setError(
        `You've used all ${FREE_DAILY_LIMIT} free predictions for today. Subscribe for unlimited predictions.`
      );
      return;
    }

    setLoading(true);
    setError("");
    setResultText("");

    setPredictedCoin(null);

    setIndicators(null);
    setIndicatorsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/predictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ coinId: matched.id }),
      });
      const data = await response.json();
      if (typeof data.usageCount === "number") setUsageCount(data.usageCount);
      if (!response.ok) throw new Error(data.message || "Prediction failed");
      setSubscriptionStatus(data.subscriptionStatus);
      setIndicators(data.indicators);
      setIndicatorsLoading(false);
      setResultText(JSON.stringify(data.prediction));
      setPredictedCoin(data.coin);
      setSymbol("");
      setSelectedCoin(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Prediction service is not available right now.");
      setIndicatorsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto min-w-0">
        <main className="flex-1 px-4 py-4">
          <div className="max-w-[1100px] mx-auto">
            <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6 md:p-8">
              <div className="text-center">
                <h1 className="text-4xl font-extrabold">CryptoBot</h1>
                <p className="text-slate-400 mt-3">
                  Get a simple BUY, SELL, or HOLD prediction for any coin.
                </p>

                <div
                  className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${
                    isPro
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-cyan-500/15 bg-cyan-500/10 text-cyan-300"
                  }`}
                >
                  {isPro
                    ? "⭐ Full Plan — Unlimited Predictions"
                    : `Free Plan — ${remaining} of ${FREE_DAILY_LIMIT} predictions left today`}
                </div>
              </div>

              <div className="mt-8 bg-[#111c2d] border border-white/5 rounded-2xl p-4 md:p-5">
                <label className="block text-sm text-slate-400 mb-2">
                  Select a Coin
                </label>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => {
                        setSymbol(e.target.value);
                        setSelectedCoin(null);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowDropdown(false), 150)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePredict();
                      }}
                      disabled={limitReached}
                      placeholder={
                        coinsLoading
                          ? "Loading coin list..."
                          : "Search any of the top 100 coins..."
                      }
                      className="w-full bg-[#0b1220] border border-white/5 rounded-2xl px-4 py-3 outline-none text-white placeholder:text-slate-500 disabled:opacity-50"
                    />

                    {showDropdown && !coinsLoading && (
                      <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1220] shadow-xl">
                        {matchingCoins.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            No matching coin found.
                          </div>
                        ) : (
                          matchingCoins.map((coin) => (
                            <button
                              key={coin.id}
                              type="button"
                              onMouseDown={() => {
                                setSelectedCoin(coin);
                                setSymbol(coin.symbol.toUpperCase());
                                setShowDropdown(false);
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

                  <button
                    onClick={
                      limitReached
                        ? () => navigate("/subscription")
                        : handlePredict
                    }
                    disabled={loading}
                    className="px-6 py-3 rounded-2xl bg-cyan-500 text-[#050b16] font-semibold hover:bg-cyan-400 transition disabled:opacity-60"
                  >
                    {loading
                      ? "Predicting..."
                      : limitReached
                      ? "Upgrade Plan"
                      : "Get Prediction"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Covers all 100 coins shown on your Dashboard — start typing a
                  name or symbol and pick one from the list.
                </p>

                {limitReached && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3">
                    <div className="text-sm text-slate-300">
                      🔒 Daily free limit reached. Subscribe for unlimited
                      Cryptobot predictions.
                    </div>
                    <button
                      onClick={() => navigate("/subscription")}
                      className="shrink-0 px-4 py-2 rounded-xl bg-cyan-400 text-[#050b16] text-sm font-semibold hover:bg-cyan-300 transition"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5 min-h-[260px]">
                  <h2 className="text-xl font-bold mb-4">Prediction Result</h2>

                  {parsedResult ? (
                    <div className="space-y-4">
                      {predictedCoin && (
                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                          <div className="flex min-w-0 items-center gap-3">
                            {predictedCoin.image && (
                              <img
                                src={predictedCoin.image}
                                alt={predictedCoin.name}
                                className="h-11 w-11 shrink-0 rounded-full"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold tracking-wide text-cyan-400">
                                PREDICTED COIN
                              </p>
                              <h3 className="mt-1 truncate text-lg font-bold text-white">
                                {predictedCoin.name}{" "}
                                <span className="text-sm text-slate-400">
                                  ({predictedCoin.symbol})
                                </span>
                              </h3>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-500">CURRENT PRICE</p>
                            <p className="mt-1 font-semibold text-white">
                              ${Number(predictedCoin.price || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-semibold text-cyan-400 tracking-wide mb-2">
                          ACTION
                        </p>
                        <div
                          className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${getActionStyles(
                            parsedResult.action
                          ).badge}`}
                        >
                          {parsedResult.action} PREDICTION
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-[#0b1220] p-4">
                        <p className="text-xs font-semibold text-cyan-400 tracking-wide mb-2">
                          REASON
                        </p>
                        <p className="text-slate-200 leading-7">
                          {parsedResult.reason}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-[#0b1220] p-4">
                        <p className="text-xs font-semibold text-cyan-400 tracking-wide mb-2">
                          RISK
                        </p>
                        <p className="text-slate-400 leading-7">
                          {parsedResult.risk}
                        </p>
                      </div>

                      {indicators && (
                        <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4">
                          <p className="text-xs text-cyan-400 mb-3 font-semibold uppercase tracking-wide">
                            Technical Indicators (calculated from 30-day price history)
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-[#0b1220] border border-white/5 p-3">
                              <p className="text-slate-500 text-xs">RSI (14-day)</p>
                              <p className="text-white font-semibold mt-1">
                                {indicators.rsi !== null ? indicators.rsi : "N/A"}{" "}
                                <span
                                  className={`text-xs ${
                                    indicators.rsiSignal === "Overbought"
                                      ? "text-rose-400"
                                      : indicators.rsiSignal === "Oversold"
                                      ? "text-emerald-400"
                                      : "text-slate-400"
                                  }`}
                                >
                                  ({indicators.rsiSignal})
                                </span>
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#0b1220] border border-white/5 p-3">
                              <p className="text-slate-500 text-xs">7-day Volume Trend</p>
                              <p className="text-white font-semibold mt-1">
                                {indicators.volumeTrend
                                  ? `${
                                      indicators.volumeTrend.percentChange > 0 ? "+" : ""
                                    }${indicators.volumeTrend.percentChange}%`
                                  : "N/A"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#0b1220] border border-white/5 p-3">
                              <p className="text-slate-500 text-xs">Support (30-day low)</p>
                              <p className="text-emerald-400 font-semibold mt-1">
                                {indicators.support !== null
                                  ? `$${indicators.support.toLocaleString()}`
                                  : "N/A"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#0b1220] border border-white/5 p-3">
                              <p className="text-slate-500 text-xs">Resistance (30-day high)</p>
                              <p className="text-rose-400 font-semibold mt-1">
                                {indicators.resistance !== null
                                  ? `$${indicators.resistance.toLocaleString()}`
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {indicatorsLoading && (
                        <p className="text-xs text-slate-500">
                          Calculating RSI, support/resistance, and volume trend...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      Your prediction will appear here after analysis.
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold">How it works</h3>
                    <p className="text-slate-400 text-sm leading-7 mt-3">
                      Enter a crypto symbol and the bot returns a short prediction
                      with a reason and a risk note.
                    </p>
                  </div>

                  <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold">Coverage</h3>
                    <p className="text-slate-400 text-sm leading-7 mt-3">
                      Works with any of the top 100 coins from your Dashboard —
                      not just the well-known ones like BTC, ETH, SOL, or XRP.
                    </p>
                  </div>

                  <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold">Note</h3>
                    <p className="text-slate-400 text-sm leading-7 mt-3">
                      Free accounts get {FREE_DAILY_LIMIT} predictions per day.
                      Subscribers get unlimited predictions. This is for demo
                      and educational use only.
                    </p>
                  </div>
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

export default Cryptobot;

