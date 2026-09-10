import React from "react";
import { Link } from "react-router-dom";

function Support() {
  return (
    <div className="min-h-screen bg-[#050b16] text-white px-4 py-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center">
            <p className="text-cyan-400 text-xs tracking-[0.35em] uppercase">
              CryptoSence
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
              Support Center
            </h1>

            <p className="text-slate-400 mt-4 max-w-3xl mx-auto leading-7">
              Need help? Contact our support team and we will assist you as
              quickly as possible.
            </p>
          </div>

          {/* Support Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <div className="text-3xl mb-3">📧</div>

              <h2 className="text-xl font-bold">
                Email Support
              </h2>

              <p className="text-slate-400 mt-3 leading-7 text-sm">
                Contact our support team for technical issues, account
                assistance, and general inquiries.
              </p>

              <p className="text-cyan-400 mt-4 font-medium">
                support@cryptosence.com
              </p>
            </div>

            <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <div className="text-3xl mb-3">📍</div>

              <h2 className="text-xl font-bold">
                Location
              </h2>

              <p className="text-slate-400 mt-3 leading-7 text-sm">
                Our team operates from Pakistan and provides support to users
                around the world.
              </p>

              <p className="text-cyan-400 mt-4 font-medium">
                Lahore, Pakistan
              </p>
            </div>

            <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <div className="text-3xl mb-3">⏱️</div>

              <h2 className="text-xl font-bold">
                Response Time
              </h2>

              <p className="text-slate-400 mt-3 leading-7 text-sm">
                We aim to respond to all support requests as quickly as
                possible.
              </p>

              <p className="text-cyan-400 mt-4 font-medium">
                Within 24 Hours
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-[#111c2d] border border-white/5 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-5">
              Frequently Asked Questions
            </h2>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold">
                  How do I create an account?
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Click the Sign Up button on the landing page and complete the
                  registration form.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">
                  How do subscriptions work?
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Users can subscribe through the Subscription page and access
                  premium features after successful payment.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">
                  Is Cryptobot financial advice?
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  No. Cryptobot provides educational and informational insights
                  only. Users should conduct their own research before making
                  financial decisions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">
                  How can I report a problem?
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Use the Feedback page or contact support via email.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/"
              className="px-5 py-3 rounded-2xl bg-cyan-500 text-[#050b16] font-semibold hover:bg-cyan-400 transition"
            >
              Back to Home
            </Link>

            <p className="text-slate-500 text-sm">
              Support Available 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;