'use client';

import { useState, useEffect } from 'react';

export default function CookieToggle() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load saved preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('gameBitCookieConsent');
    if (saved !== null) {
      setIsEnabled(saved === 'true');
    }
  }, []);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('gameBitCookieConsent', String(newState));
    console.log(`Cookie consent ${newState ? 'enabled' : 'disabled'}`);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        disabled
        className="relative inline-flex h-7 w-12 items-center rounded-full border border-white/20 bg-white/10 transition-all cursor-not-allowed"
        role="switch"
        aria-checked="true"
        aria-label="Toggle advertising cookies"
      >
        <span className="inline-block h-5 w-5 transform rounded-full bg-orange-400 shadow-md transition translate-x-6" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
        isEnabled
          ? 'border-orange-500/40 bg-orange-500/20'
          : 'border-white/20 bg-white/10'
      }`}
      role="switch"
      aria-checked={isEnabled}
      aria-label="Toggle advertising cookies"
    >
      <span
        className={`inline-block h-5 w-5 rounded-full shadow-md transition-transform ${
          isEnabled ? 'translate-x-6 bg-orange-400' : 'translate-x-0.5 bg-gray-400'
        }`}
      />
    </button>
  );
}
