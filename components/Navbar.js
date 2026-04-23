"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const path = usePathname();
  const { user, loading, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm shadow-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md shadow-brand-500/30 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">FairSight</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={path === "/"}>Home</NavLink>
            <NavLink href="/analyze" active={path === "/analyze"}>Dataset</NavLink>
            <NavLink href="/model" active={path === "/model" || path === "/model-dashboard"}>
              <span className="flex items-center gap-1">🤖 Model</span>
            </NavLink>
            <NavLink href="/dashboard" active={path === "/dashboard"}>Dashboard</NavLink>
            <NavLink href="/history" active={path === "/history"}>
              <span className="flex items-center gap-1">🕐 History</span>
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            {!loading && !user && (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  Sign in
                </button>
                <button
                  onClick={() => setShowAuth(true)}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/25 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Get started
                </button>
              </>
            )}

            {!loading && user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2.5 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand-500/25">
                    {initials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-400 leading-tight">{user.totalAnalyses ?? 0} analyses</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span>🕐</span> Activity history
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        active
          ? "text-brand-600 bg-brand-50"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />
      )}
    </Link>
  );
}
