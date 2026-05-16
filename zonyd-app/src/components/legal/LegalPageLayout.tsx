'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  icon: string;
  lastUpdated: string;
  version: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  subtitle,
  icon,
  lastUpdated,
  version,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[#232733] bg-[rgba(11,11,15,0.95)] backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/legal"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#151821] border border-[#232733] text-[#A1A1AA] hover:text-white hover:border-[#FF9F0A] transition-all text-sm"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#A1A1AA] truncate">
              Centro Legal / {title}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-[#A1A1AA] bg-[#151821] border border-[#232733] px-2 py-1 rounded-lg">
              v{version}
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-[#232733] bg-[linear-gradient(180deg,rgba(255,159,10,0.04)_0%,transparent_100%)]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="text-4xl mb-4">{icon}</div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-[#A1A1AA] text-base mb-4">{subtitle}</p>
          <div className="flex flex-wrap gap-3 text-xs text-[#A1A1AA]">
            <span className="flex items-center gap-1.5 bg-[#151821] border border-[#232733] px-3 py-1.5 rounded-full">
              📅 Última actualización: {lastUpdated}
            </span>
            <span className="flex items-center gap-1.5 bg-[#151821] border border-[#232733] px-3 py-1.5 rounded-full">
              📄 Versión {version}
            </span>
          </div>
        </div>
      </div>

      {/* Legal content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="legal-prose">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#232733]">
          <p className="text-xs text-[#A1A1AA] mb-4">
            Para consultas sobre este documento contacta a{' '}
            <a href="mailto:legal@zonyd.com" className="text-[#4F8CFF] hover:underline">
              legal@zonyd.com
            </a>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/legal/terms" className="text-xs text-[#A1A1AA] hover:text-white transition-colors">Términos</Link>
            <span className="text-[#232733]">·</span>
            <Link href="/legal/privacy" className="text-xs text-[#A1A1AA] hover:text-white transition-colors">Privacidad</Link>
            <span className="text-[#232733]">·</span>
            <Link href="/legal/copyright" className="text-xs text-[#A1A1AA] hover:text-white transition-colors">Copyright</Link>
            <span className="text-[#232733]">·</span>
            <Link href="/legal/distribution-agreement" className="text-xs text-[#A1A1AA] hover:text-white transition-colors">Distribución</Link>
            <span className="text-[#232733]">·</span>
            <Link href="/legal/subscriptions" className="text-xs text-[#A1A1AA] hover:text-white transition-colors">Suscripciones</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
