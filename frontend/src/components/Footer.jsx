import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-[#070f1c] border-t border-white/5 px-6 py-5">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-3">
        {/* Logo & Copyright */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/cryptosence.svg"
              alt="CryptoSence"
              className="w-8 h-8 rounded-lg"
            />
            <h2 className="text-cyan-400 text-xl font-bold">
              CryptoSence
            </h2>
          </div>

          <p className="text-slate-400 text-xs mt-2">
            © 2026 CryptoSence. All rights reserved.
          </p>

          <p className="text-slate-500 text-xs mt-1">
            Real-time insights. AI-powered guidance. Smarter decisions.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-[12px] text-slate-400">
          <Link
            to="/privacy-policy"
            className="hover:text-cyan-400 transition"
          >
            Privacy Policy
          </Link>

          <Link
            to="/terms-of-service"
            className="hover:text-cyan-400 transition"
          >
            Terms of Service
          </Link>

          <Link
            to="/support"
            className="hover:text-cyan-400 transition"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;