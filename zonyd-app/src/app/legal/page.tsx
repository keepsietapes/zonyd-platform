import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal — Zonyd',
  description: 'Documentos legales de Zonyd: Términos, Privacidad, Copyright y más.',
};

const legalDocs = [
  {
    href: '/legal/terms',
    icon: '📋',
    title: 'Términos y Condiciones',
    description: 'Reglas de uso de la plataforma, licencias, pagos y terminación de cuenta.',
    badge: 'Requerido al registrarse',
    badgeColor: 'orange',
  },
  {
    href: '/legal/privacy',
    icon: '🔒',
    title: 'Política de Privacidad',
    description: 'Qué datos recopilamos, cómo los usamos y tus derechos ARCO.',
    badge: 'Requerido al registrarse',
    badgeColor: 'orange',
  },
  {
    href: '/legal/distribution-agreement',
    icon: '🎵',
    title: 'Acuerdo de Distribución Musical',
    description: 'Términos específicos para distribuir tu música a través de Zonyd.',
    badge: 'Requerido al distribuir',
    badgeColor: 'purple',
  },
  {
    href: '/legal/copyright',
    icon: '⚖️',
    title: 'Política de Copyright y Anti-Fraude',
    description: 'Procedimiento DMCA, sistema de strikes y política anti-streaming artificial.',
    badge: 'Requerido al registrarse',
    badgeColor: 'orange',
  },
  {
    href: '/legal/subscriptions',
    icon: '💳',
    title: 'Política de Suscripciones',
    description: 'Planes, facturación, cancelación, reembolsos y renovación automática.',
    badge: 'Informativo',
    badgeColor: 'gray',
  },
];

const badgeClasses: Record<string, string> = {
  orange: 'bg-[rgba(255,159,10,0.15)] text-[#FF9F0A] border border-[rgba(255,159,10,0.3)]',
  purple: 'bg-[rgba(123,97,255,0.15)] text-[#7B61FF] border border-[rgba(123,97,255,0.3)]',
  gray:   'bg-[rgba(161,161,170,0.1)] text-[#A1A1AA] border border-[rgba(161,161,170,0.2)]',
};

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      {/* Header */}
      <div className="border-b border-[#232733]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#151821] border border-[#232733] text-[#A1A1AA] hover:text-white hover:border-[#FF9F0A] transition-all"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">Centro Legal</h1>
            <p className="text-sm text-[#A1A1AA]">Documentos y políticas de Zonyd</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-[#A1A1AA] text-sm leading-relaxed">
            Todos los documentos legales de la plataforma. Al usar Zonyd, aceptas los términos
            marcados como <span className="text-[#FF9F0A]">requeridos</span>. Si tienes dudas,
            contáctanos en{' '}
            <a href="mailto:legal@zonyd.com" className="text-[#4F8CFF] hover:underline">
              legal@zonyd.com
            </a>
          </p>
        </div>

        <div className="grid gap-4">
          {legalDocs.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="group flex items-start gap-5 p-5 rounded-2xl bg-[#151821] border border-[#232733] hover:border-[#FF9F0A]/40 hover:bg-[#1a1f2e] transition-all duration-200"
            >
              <div className="text-2xl mt-0.5 flex-shrink-0">{doc.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-white group-hover:text-[#FF9F0A] transition-colors">
                    {doc.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClasses[doc.badgeColor]}`}>
                    {doc.badge}
                  </span>
                </div>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{doc.description}</p>
              </div>
              <div className="text-[#A1A1AA] group-hover:text-[#FF9F0A] transition-colors mt-1 flex-shrink-0">
                →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 p-5 rounded-2xl bg-[rgba(79,140,255,0.08)] border border-[rgba(79,140,255,0.2)]">
          <p className="text-sm text-[#A1A1AA]">
            <span className="text-[#4F8CFF] font-semibold">¿Tienes dudas?</span>{' '}
            Para consultas legales, envía un correo a{' '}
            <a href="mailto:legal@zonyd.com" className="text-[#4F8CFF] hover:underline">
              legal@zonyd.com
            </a>
            . Para reportar infracciones de copyright:{' '}
            <a href="mailto:copyright@zonyd.com" className="text-[#4F8CFF] hover:underline">
              copyright@zonyd.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
