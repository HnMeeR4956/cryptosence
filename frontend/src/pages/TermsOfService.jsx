import React from "react";
import { Link } from "react-router-dom";

function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050b16] text-white px-4 py-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="text-center">
            <p className="text-cyan-400 text-xs tracking-[0.35em] uppercase">
              CryptoSence
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
              Terms of Service
            </h1>

            <p className="text-slate-400 mt-4 max-w-3xl mx-auto leading-7">
              These Terms of Service govern your use of the CryptoSence platform.
              By accessing or using our services, you agree to these terms.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                1. Acceptance of Terms
              </h2>

              <p className="text-slate-400 leading-7">
                By creating an account or using CryptoSence, you agree to comply
                with these Terms of Service and all applicable laws.
              </p>
            </section>

            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                2. User Accounts
              </h2>

              <p className="text-slate-400 leading-7">
                Users are responsible for maintaining the confidentiality of
                their account credentials and for all activities that occur
                under their account.
              </p>
            </section>

            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                3. Platform Usage
              </h2>

              <p className="text-slate-400 leading-7">
                Users may access crypto market data, Cryptobot, Learning Hub,
                subscriptions, and other platform services for lawful purposes
                only.
              </p>
            </section>

            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                4. Financial Disclaimer
              </h2>

              <p className="text-slate-400 leading-7">
                CryptoSence provides educational information and AI-generated
                insights. Nothing on the platform should be considered
                professional financial or investment advice.
              </p>
            </section>

            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                5. Subscription Services
              </h2>

              <p className="text-slate-400 leading-7">
                Subscription plans provide access to premium features. Pricing,
                billing, and renewal policies may change with notice.
              </p>
            </section>

            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                6. Prohibited Activities
              </h2>

              <p className="text-slate-400 leading-7">
                Users may not misuse the platform, attempt unauthorized access,
                distribute harmful content, or engage in illegal activities.
              </p>
            </section>

            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                7. Limitation of Liability
              </h2>

              <p className="text-slate-400 leading-7">
                CryptoSence is not responsible for financial losses, trading
                decisions, or damages resulting from the use of platform data
                or AI-generated responses.
              </p>
            </section>

            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                8. Changes to Terms
              </h2>

              <p className="text-slate-400 leading-7">
                We reserve the right to modify these terms at any time. Updated
                versions will be posted on this page.
              </p>
            </section>

            <section className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-2">
                9. Contact Information
              </h2>

              <p className="text-slate-400 leading-7">
                Email: support@cryptosence.com
                <br />
                Location: Lahore, Pakistan
              </p>
            </section>
          </div>

          <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-between gap-4">
            <Link
              to="/"
              className="px-5 py-3 rounded-2xl bg-cyan-500 text-[#050b16] font-semibold hover:bg-cyan-400 transition"
            >
              Back to Home
            </Link>

            <p className="text-slate-500 text-sm">
              Last Updated: January 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;