"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  function handleSignIn(provider: string) {
    setLoading(provider);
    signIn(provider, { callbackUrl: "/planning" });
  }

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      {/* Left panel — brand surface */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-sidebar-bg flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-base tracking-tight">CP</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white leading-tight tracking-tight">CapPlan</h1>
              <p className="text-[0.75rem] text-sidebar-text leading-tight">Chauffeurplanning</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-display text-[2rem] font-bold text-white leading-[1.2] tracking-tight">
              Capaciteitsplanning<br />
              op <span className="text-brand-400">orde.</span>
            </h2>
            <p className="text-[0.9375rem] text-sidebar-text leading-relaxed max-w-sm">
              Beheer chauffeurplanning, roosters en beschikbaarheid vanuit een helder overzicht.
            </p>
          </div>
        </div>

        <p className="text-[0.6875rem] text-sidebar-text/40">
          CapPlan v2.0
        </p>
      </div>

      {/* Right panel — sign-in */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">CP</span>
            </div>
            <div>
              <h1 className="text-[0.9375rem] font-semibold text-text-primary leading-tight tracking-tight">CapPlan</h1>
              <p className="text-[0.6875rem] text-text-tertiary leading-tight">Chauffeurplanning</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="font-display text-[1.5rem] font-bold text-text-primary tracking-tight">
              Inloggen
            </h2>
            <p className="text-[0.875rem] text-text-secondary leading-relaxed">
              Gebruik je organisatieaccount om in te loggen.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSignIn("google")}
              disabled={loading !== null}
              className="login-provider-btn group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.27l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="flex-1 text-left">
                Doorgaan met Google
              </span>
              {loading === "google" && (
                <span className="spinner !w-4 !h-4 !border-[1.5px]" />
              )}
            </button>

            <button
              onClick={() => handleSignIn("azure-ad")}
              disabled={loading !== null}
              className="login-provider-btn group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022" />
                <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00" />
                <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF" />
                <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900" />
              </svg>
              <span className="flex-1 text-left">
                Doorgaan met Microsoft
              </span>
              {loading === "azure-ad" && (
                <span className="spinner !w-4 !h-4 !border-[1.5px]" />
              )}
            </button>
          </div>

          <p className="mt-8 text-[0.75rem] text-text-tertiary leading-relaxed text-center">
            Neem contact op met je beheerder als je geen toegang hebt.
          </p>
        </div>
      </div>
    </div>
  );
}
