import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Política de Suscripciones — Zonyd',
  description: 'Planes, precios, facturación, cancelación, reembolsos y renovación automática de Zonyd.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#232733]">{title}</h2>
      <div className="space-y-3 text-sm text-[#C1C1C8] leading-relaxed">{children}</div>
    </section>
  );
}

const plans = [
  {
    name: 'Free',
    price: '$0 MXN',
    period: 'mes',
    color: '#A1A1AA',
    bg: '#151821',
    border: '#232733',
    features: ['1 artista', '[LÍMITE] lanzamientos', 'Comisión [X]%', 'Tiendas estándar', 'Soporte comunidad'],
  },
  {
    name: 'Pro',
    price: '$[PRECIO]',
    period: 'mes',
    color: '#FF9F0A',
    bg: 'rgba(255,159,10,0.06)',
    border: 'rgba(255,159,10,0.3)',
    badge: 'Popular',
    features: ['[N] artistas', 'Lanzamientos ilimitados', 'Comisión [X]%', 'Todas las tiendas', 'YouTube Content ID', 'Splits de regalías', 'Soporte prioritario'],
  },
  {
    name: 'Label',
    price: '$[PRECIO]',
    period: 'mes',
    color: '#7B61FF',
    bg: 'rgba(123,97,255,0.06)',
    border: 'rgba(123,97,255,0.3)',
    features: ['[N] artistas', 'Lanzamientos ilimitados', 'Comisión [X]%', 'Label name personalizado', 'Acceso API', 'Gestor de cuenta dedicado', 'Reportes avanzados'],
  },
];

export default function SubscriptionsPage() {
  return (
    <LegalPageLayout
      icon="💳"
      title="Política de Suscripciones"
      subtitle="Planes, facturación, renovación automática, cancelación y reembolsos."
      lastUpdated="[DD/MM/AAAA]"
      version="1.0"
    >
      <Section title="1. Planes Disponibles">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{ background: plan.bg, borderColor: plan.border }}
              className="relative p-5 rounded-2xl border"
            >
              {plan.badge && (
                <span
                  style={{ background: plan.color, color: '#0B0B0F' }}
                  className="absolute -top-2.5 left-4 text-xs font-bold px-2 py-0.5 rounded-full"
                >
                  {plan.badge}
                </span>
              )}
              <p style={{ color: plan.color }} className="text-xs font-bold mb-1 uppercase tracking-widest">
                {plan.name}
              </p>
              <p className="text-2xl font-bold text-white">
                {plan.price}
                <span className="text-sm font-normal text-[#A1A1AA]">/{plan.period}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[#C1C1C8]">
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#A1A1AA] mt-3">
          Precios actualizados siempre disponibles en{' '}
          <a href="/pricing" className="text-[#4F8CFF] hover:underline">zonyd.com/pricing</a>
        </p>
      </Section>

      <Section title="2. Renovación Automática">
        <div className="p-4 rounded-xl bg-[rgba(255,159,10,0.08)] border border-[rgba(255,159,10,0.25)] text-[#FF9F0A] text-sm mb-4">
          ⚠️ Al suscribirte, <strong>autorizas la renovación automática</strong> al inicio de cada
          nuevo período. Enviaremos un recordatorio por email al menos 7 días antes del cobro.
        </div>
        <p>
          Para cancelar la renovación automática ve a{' '}
          <strong className="text-white">Configuración → Facturación → Gestionar Suscripción</strong>{' '}
          con al menos <strong className="text-white">24 horas</strong> de anticipación a la fecha de renovación.
        </p>
      </Section>

      <Section title="3. Efectos de la Cancelación">
        <div className="space-y-3">
          {[
            ['Acceso al plan', 'Continúa hasta el último día del período ya pagado'],
            ['Período de gracia', '30 días adicionales con catálogo activo'],
            ['Retiro del catálogo', 'Después del período de gracia si no se renueva'],
            ['Regalías acumuladas', 'Continúan procesándose y disponibles para retiro'],
          ].map(([item, desc]) => (
            <div key={item} className="flex items-start gap-3 p-3 rounded-xl bg-[#151821] border border-[#232733]">
              <span className="text-[#34C759] font-bold text-sm flex-shrink-0">→</span>
              <div>
                <p className="text-sm font-medium text-white">{item}</p>
                <p className="text-xs text-[#A1A1AA] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="4. Política de Reembolsos">
        <p>
          Las cuotas son <strong className="text-white">no reembolsables</strong> una vez procesadas,
          con estas excepciones:
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#232733] mt-3">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1f2e]">
                <th className="px-4 py-3 text-left text-xs text-[#A1A1AA] font-semibold">Situación</th>
                <th className="px-4 py-3 text-left text-xs text-[#A1A1AA] font-semibold">Política</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Error técnico de cobro (doble cargo, monto incorrecto)', 'Reembolso completo del monto incorrecto'],
                ['Primera suscripción — solicitud dentro de 48 horas', 'Reembolso completo (una sola vez por cuenta)'],
                ['Terminación de cuenta sin causa imputable al artista', 'Reembolso proporcional al tiempo no utilizado'],
              ].map(([sit, pol], i) => (
                <tr key={i} className="border-t border-[#232733] hover:bg-[#151821] transition-colors">
                  <td className="px-4 py-3 text-sm text-[#C1C1C8]">{sit}</td>
                  <td className="px-4 py-3 text-sm text-[#34C759] font-medium">{pol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#A1A1AA] mt-3">
          Solicitudes de reembolso a{' '}
          <a href="mailto:facturacion@zonyd.com" className="text-[#4F8CFF] hover:underline">
            facturacion@zonyd.com
          </a>{' '}
          — respondemos en 5 días hábiles.
        </p>
      </Section>

      <Section title="5. Cambios de Plan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[rgba(52,199,89,0.08)] border border-[rgba(52,199,89,0.25)]">
            <p className="text-sm font-semibold text-[#34C759] mb-2">⬆ Upgrade</p>
            <p className="text-sm text-[#C1C1C8]">
              Cambio inmediato con cargo prorrateado por los días restantes del período actual.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,159,10,0.08)] border border-[rgba(255,159,10,0.25)]">
            <p className="text-sm font-semibold text-[#FF9F0A] mb-2">⬇ Downgrade</p>
            <p className="text-sm text-[#C1C1C8]">
              Entra en vigor al inicio del siguiente período de facturación.
            </p>
          </div>
        </div>
      </Section>

      <Section title="6. Suspensión por Falta de Pago">
        <div className="space-y-2">
          {[
            ['Día 1', 'Primer intento fallido + notificación por email'],
            ['Día 3', 'Segundo intento + notificación de urgencia'],
            ['Día 7', 'Tercer intento + suscripción entra en "Suspendida"'],
            ['Día 15', 'Sin regularización: baja automática a plan Free'],
            ['Día 45', 'Contenido excedente puede ser retirado'],
          ].map(([day, action]) => (
            <div key={day} className="flex items-center gap-3 p-3 rounded-xl bg-[#151821] border border-[#232733]">
              <span className="text-xs font-bold text-[#FF453A] flex-shrink-0 w-12">{day}</span>
              <span className="text-sm text-[#C1C1C8]">{action}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="7. Facturación (CFDI)">
        <p>
          Emitimos CFDI para artistas y empresas en México. Solicita tu factura dentro del{' '}
          <strong className="text-white">mismo mes calendario</strong> del cobro en{' '}
          <strong className="text-white">Configuración → Facturación → Solicitar CFDI</strong> o a{' '}
          <a href="mailto:facturacion@zonyd.com" className="text-[#4F8CFF] hover:underline">
            facturacion@zonyd.com
          </a>
          .
        </p>
      </Section>

      <Section title="8. Cambios de Precio">
        <p>
          Los cambios de precio se notifican con al menos{' '}
          <strong className="text-white">30 días de anticipación</strong> por email. No afectan los
          períodos ya pagados. Puedes cancelar antes de que entren en vigor si no estás de acuerdo.
        </p>
      </Section>
    </LegalPageLayout>
  );
}
