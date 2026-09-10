import React from 'react'
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
function Privacy() {
  return (
    <div className="min-h-screen bg-[#050b16] text-white flex flex-col">
      <main className="flex-1 px-4 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-[#0d1727] border border-white/5 rounded-3xl p-6 md:p-8">
            {/* Header */}
            <div className="text-center">
              <p className="text-cyan-400 text-xs tracking-[0.35em] uppercase">
                CryptoSence
              </p>

              <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
                Privacy Policy
              </h1>

              <p className="text-slate-400 mt-4 max-w-3xl mx-auto leading-7">
                Your privacy is important to us. This Privacy Policy explains
                how CryptoSence collects, uses, and protects your information.
              </p>
            </div>

            {/* Content */}
            <div className="mt-8 space-y-5">
              <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-3">
                  1. Information We Collect
                </h2>

                <p className="text-slate-400 leading-7">
                  We may collect information such as your name, email address,
                  account credentials, subscription details, and platform usage
                  activity to improve our services.
                </p>
              </div>

              <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-3">
                  2. How We Use Your Information
                </h2>

                <p className="text-slate-400 leading-7">
                  Your information is used to manage your account, provide
                  platform services, process subscriptions, improve user
                  experience, and provide customer support.
                </p>
              </div>

              <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-3">
                  3. Data Security
                </h2>

                <p className="text-slate-400 leading-7">
                  We use reasonable security measures to protect your personal
                  information from unauthorized access, disclosure, or misuse.
                </p>
              </div>

              <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-3">
                  4. Third-Party Services
                </h2>

                <p className="text-slate-400 leading-7">
                  CryptoSence may use third-party services such as CoinGecko,
                  Gemini, Stripe, and other providers. These services operate
                  under their own privacy policies.
                </p>
              </div>

              <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-3">
                  5. Cookies and Analytics
                </h2>

                <p className="text-slate-400 leading-7">
                  We may use cookies and analytics tools to understand user
                  behavior, improve performance, and enhance the platform.
                </p>
              </div>

              <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-3">
                  6. User Rights
                </h2>

                <p className="text-slate-400 leading-7">
                  Users may request access, correction, or deletion of their
                  information where applicable under local regulations.
                </p>
              </div>

              <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-3">
                  7. Changes to This Policy
                </h2>

                <p className="text-slate-400 leading-7">
                  CryptoSence reserves the right to update this Privacy Policy
                  at any time. Updated versions will be posted on this page.
                </p>
              </div>

              <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-3">
                  8. Contact Us
                </h2>

                <p className="text-slate-400 leading-7">
                  If you have questions regarding this Privacy Policy, please
                  contact us:
                </p>

                <div className="mt-4 text-slate-300">
                  <p>Email: support@cryptosence.com</p>
                  <p>Location: Lahore, Pakistan</p>
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
                Last Updated: January 2026
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Privacy;