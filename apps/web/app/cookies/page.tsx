// apps/web/app/cookies/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import CookieToggle from "@/components/cookies/CookieToggle";

export const metadata: Metadata = {
  title: "Cookie Settings | TheGameBit",
  description: "Manage your cookie preferences and advertising consent.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold uppercase tracking-tight text-white">
        Cookie Settings
      </h1>
      <p className="mt-3 text-xs text-white/30 font-[family-name:var(--font-ibm-plex)] uppercase tracking-widest">
        Manage your privacy and advertising preferences
      </p>
      <p className="mt-6 text-sm text-white/60 font-[family-name:var(--font-ibm-plex)] leading-relaxed">
        TheGameBit uses cookies to provide essential site functionality and display personalized ads through Google AdSense. You can manage your preferences below.
      </p>

      {/* Essential Cookies */}
      <section className="mt-10 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-ibm-plex)]">
          Essential cookies (always enabled)
        </h2>
        <div className="border border-white/10 bg-white/5 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/80">
                Functional & Performance
              </p>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                Remember your timer settings, season preferences, daily streaks, and liked cards. Stored locally in your browser.
              </p>
            </div>
            <div className="ml-4 flex items-center">
              <span className="inline-flex items-center justify-center w-12 h-7 rounded-full bg-green-500/20 border border-green-500/40">
                <span className="text-xs font-bold text-green-400">ON</span>
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/40 font-[family-name:var(--font-ibm-plex)]">
          These cookies cannot be disabled as they are required for the site to function properly.
        </p>
      </section>

      {/* Consent Cookie */}
      <section className="mt-10 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-ibm-plex)]">
          Consent Preferences
        </h2>
        <div className="space-y-3">
          <div className="border border-white/10 bg-white/5 p-4 rounded">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/80">
                  Advertising & Personalization
                </p>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">
                  Google AdSense and advertising partners use cookies to serve relevant ads based on your browsing activity. Disabling this may show less relevant ads but will not prevent all ads.
                </p>
                <p className="mt-2 text-xs text-orange-400/80">
                  <strong>Cookie name:</strong> <code className="bg-white/5 px-1 py-0.5 rounded text-xs">gameBitCookieConsent</code>
                </p>
              </div>
              <div className="ml-4 mt-1">
                <CookieToggle />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Disclosure */}
      <section className="mt-10 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-ibm-plex)]">
          Third-party services
        </h2>
        <ul className="space-y-3 text-sm text-white/60 font-[family-name:var(--font-ibm-plex)]">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-400/60" />
            <div>
              <strong className="text-white/80">Google AdSense</strong> — Displays targeted advertisements and uses cookies for ad personalization.{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300"
              >
                Learn more
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-400/60" />
            <div>
              <strong className="text-white/80">Google Analytics (if enabled)</strong> — Helps us understand site usage. You can opt out using{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300"
              >
                Google's opt-out browser extension
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-400/60" />
            <div>
              <strong className="text-white/80">Browser Privacy Controls</strong> — Most browsers allow you to block or delete cookies in settings.
            </div>
          </li>
        </ul>
      </section>

      {/* Opt-out Options */}
      <section className="mt-10 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-ibm-plex)]">
          Opt-out & Additional Controls
        </h2>
        <div className="border-l-2 border-orange-400/30 bg-orange-400/5 p-4 rounded">
          <ul className="space-y-2 text-sm text-white/60 font-[family-name:var(--font-ibm-plex)]">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-400/60" />
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                Google Ads Settings — opt out of personalized advertising
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-400/60" />
              <a
                href="https://optout.aboutads.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                NAI Opt-out Tool (US) — manage cookies from advertising networks
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-400/60" />
              <a
                href="https://www.youronlinechoices.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                Your Online Choices (EU) — control cookies across European sites
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Data Retention */}
      <section className="mt-10 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-ibm-plex)]">
          Data retention
        </h2>
        <p className="text-sm text-white/60 font-[family-name:var(--font-ibm-plex)] leading-relaxed">
          Cookies remain on your device until you clear your browser data or they expire. Advertising cookies set by Google typically expire after 30 days. Your consent preference (gameBitCookieConsent) is stored indefinitely until you reset it.
        </p>
      </section>

      {/* More Info */}
      <section className="mt-10 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-ibm-plex)]">
          More information
        </h2>
        <p className="text-sm text-white/60 font-[family-name:var(--font-ibm-plex)] leading-relaxed">
          For detailed information about how we use your data, please see our{" "}
          <Link href="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">
            Privacy Policy
          </Link>
          . Questions about your cookies or privacy? Contact us at{" "}
          <a
            href="mailto:contact@thegamebit.online"
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            contact@thegamebit.online
          </a>
          .
        </p>
      </section>

      <div className="mt-12">
        <Link
          href="/"
          className="text-sm text-white/30 hover:text-white transition-colors font-[family-name:var(--font-ibm-plex)]"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}