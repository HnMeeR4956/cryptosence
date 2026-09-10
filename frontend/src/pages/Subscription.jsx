import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Subscription() {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [subscription, setSubscription] = useState(null);

  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);

  const loadSubscription = async () => {
    try {
      setFetching(true);

      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSubscription({
          status: data.user?.subscriptionStatus || "inactive",
        });
      } else {
        setMessage(data.message || "Failed to load subscription");
      }
    } catch (error) {
      setMessage("Unable to load subscription");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const verifyAndLoad = async () => {
      const sessionId = params.get("session_id");

      if (params.get("success") === "1" && sessionId) {
        setMessage("Payment successful. Activating your subscription...");
        try {
          const response = await fetch(
            `${API_BASE}/api/subscriptions/verify-session`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ sessionId }),
            }
          );
          const data = await response.json();

          if (response.ok) {
            setMessage(
              "Subscription activated! You now have unlimited Cryptobot predictions."
            );
            window.history.replaceState({}, "", "/subscription");
          } else {
            setMessage(
              data.message ||
                "Payment succeeded, but activation failed. Please contact support."
            );
          }
        } catch (error) {
          setMessage(
            "Payment succeeded, but activation failed. Please refresh this page."
          );
        }
      }

      if (params.get("canceled") === "1") {
        setMessage("Checkout was canceled.");
      }

      loadSubscription();
    };

    verifyAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE}/api/subscriptions/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to start checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE}/api/subscriptions/create-portal-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to open portal");
      }

      window.location.href = data.url;
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    return status === "active" ? "Active" : "Inactive";
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto min-w-0">
        <main className="flex-1 px-4 py-4">
          <div className="max-w-[1180px] mx-auto">
            <div className="bg-[#0d1727] border border-white/5 rounded-3xl px-6 py-12 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Subscription
              </h1>
              <p className="text-slate-400 mt-4 max-w-3xl mx-auto leading-7">
                Subscribe once and get access to CryptoSence premium features.
              </p>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 mt-6">
              <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-8">
                <div className="inline-flex px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  Premium Plan
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mt-4">
                  CryptoSence Premium
                </h2>

                <p className="text-slate-400 mt-3 max-w-2xl leading-7">
                  The Dashboard is free for every account. Subscribing removes
                  Cryptobot's daily prediction limit, so you get unlimited
                  BUY/SELL/HOLD calls whenever you need them.
                </p>

                <div className="mt-8">
                  <span className="text-5xl font-extrabold text-cyan-400">
                    ₨ 2,883.15
                  </span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
                    ✓ Unlimited Cryptobot predictions
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
                    ✓ No daily question limit
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
                    ✓ Priority support via Feedback
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
                    ✓ Cancel anytime
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="mt-8 w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition rounded-2xl px-6 py-3 text-sm font-medium"
                >
                  {loading ? "Redirecting to Stripe..." : "Subscribe Now"}
                </button>

                <div className="mt-8 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="grid grid-cols-3 bg-white/5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <div className="p-3">Feature</div>
                    <div className="p-3 text-center">Free</div>
                    <div className="p-3 text-center text-cyan-400">Premium</div>
                  </div>

                  <div className="grid grid-cols-3 border-t border-white/5 text-sm">
                    <div className="p-3 text-slate-300">Dashboard (100 coins)</div>
                    <div className="p-3 text-center text-emerald-400">✓</div>
                    <div className="p-3 text-center text-emerald-400">✓</div>
                  </div>

                  <div className="grid grid-cols-3 border-t border-white/5 text-sm">
                    <div className="p-3 text-slate-300">Cryptobot predictions</div>
                    <div className="p-3 text-center text-slate-400">5 / day</div>
                    <div className="p-3 text-center text-emerald-400">Unlimited</div>
                  </div>

                  <div className="grid grid-cols-3 border-t border-white/5 text-sm">
                    <div className="p-3 text-slate-300">Learning Hub</div>
                    <div className="p-3 text-center text-emerald-400">✓</div>
                    <div className="p-3 text-center text-emerald-400">✓</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4">Current Subscription</h3>

                  {fetching ? (
                    <p className="text-slate-400 text-sm">Loading...</p>
                  ) : subscription ? (
                    <div className="space-y-3 text-sm text-slate-300">
                      <p>
                        <span className="text-slate-500">Status:</span>{" "}
                        <span
                          className={
                            subscription.status === "active"
                              ? "text-emerald-400 font-semibold"
                              : "text-slate-400 font-semibold"
                          }
                        >
                          {getStatusLabel(subscription.status)}
                        </span>
                      </p>

                      <button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        className="w-full mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-60"
                      >
                        {portalLoading ? "Opening..." : "Manage in Stripe Portal"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      No active subscription found.
                    </p>
                  )}
                </div>

                <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4">Why subscribe?</h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      Unlimited Cryptobot predictions, any time of day
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      No waiting for tomorrow's free predictions to reset
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      Same live Dashboard everyone already gets, for free
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      Cancel any time from the Stripe portal below
                    </div>
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
export default Subscription;