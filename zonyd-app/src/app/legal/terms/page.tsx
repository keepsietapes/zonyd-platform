import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Zonyd',
  description: 'Lee los Términos y Condiciones de uso de la plataforma Zonyd de distribución musical.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#232733]">{title}</h2>
      <div className="space-y-3 text-sm text-[#C1C1C8] leading-relaxed">{children}</div>
    </section>
  );
}

function HighlightBox({ type, children }: { type: 'info' | 'warning' | 'important'; children: React.ReactNode }) {
  const styles = {
    info:      'bg-[rgba(79,140,255,0.08)] border-[rgba(79,140,255,0.25)] text-[#4F8CFF]',
    warning:   'bg-[rgba(255,159,10,0.08)] border-[rgba(255,159,10,0.25)] text-[#FF9F0A]',
    important: 'bg-[rgba(255,69,58,0.08)] border-[rgba(255,69,58,0.25)] text-[#FF453A]',
  };
  const icons = { info: 'ℹ️', warning: '⚠️', important: '🚨' };
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${styles[type]} mb-4`}>
      <span className="text-base flex-shrink-0">{icons[type]}</span>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function TableRow({ cells, header = false }: { cells: string[]; header?: boolean }) {
  const Tag = header ? 'th' : 'td';
  return (
    <tr className={header ? 'bg-[#1a1f2e]' : 'border-t border-[#232733] hover:bg-[#151821] transition-colors'}>
      {cells.map((cell, i) => (
        <Tag key={i} className={`px-4 py-3 text-left text-sm ${header ? 'text-[#A1A1AA] font-semibold' : 'text-[#C1C1C8]'}`}>
          {cell}
        </Tag>
      ))}
    </tr>
  );
}

export default function TermsPage() {
  return (
    <LegalPageLayout
      icon="📋"
      title="Términos y Condiciones de Uso"
      subtitle="Al crear una cuenta o usar Zonyd, aceptas estos términos en su totalidad."
      lastUpdated="[DD/MM/AAAA]"
      version="1.0"
    >
      <HighlightBox type="important">
        Al hacer clic en "Crear cuenta" o continuar usando la plataforma aceptas quedar vinculado
        jurídicamente por estos Términos. Si no estás de acuerdo, no debes usar Zonyd.
      </HighlightBox>

      <Section title="1. Descripción del Servicio">
        <p>
          Zonyd es una plataforma SaaS de distribución musical digital que permite a artistas
          independientes distribuir su música a Spotify, Apple Music, Amazon Music, YouTube Music,
          Deezer, TikTok y más de 150 tiendas digitales.
        </p>
        <p>
          Zonyd actúa como <strong className="text-white">distribuidor intermediario</strong>, no como
          sello discográfico ni co-titular de tus derechos.
        </p>
      </Section>

      <Section title="2. Elegibilidad">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Debes tener al menos <strong className="text-white">18 años de edad</strong></li>
          <li>Debes tener capacidad legal plena para celebrar contratos</li>
          <li>No debes haber sido suspendido previamente de Zonyd</li>
          <li>La información que proporciones debe ser veraz y actualizada</li>
        </ul>
      </Section>

      <Section title="3. Suscripciones y Pagos">
        <div className="overflow-x-auto rounded-xl border border-[#232733] mb-4">
          <table className="w-full">
            <thead><TableRow cells={['Plan', 'Precio', 'Artistas', 'Comisión']} header /></thead>
            <tbody>
              <TableRow cells={['Free', '$0 MXN/mes', '1', '[X]%']} />
              <TableRow cells={['Pro', '$[PRECIO] MXN/mes', '[N]', '[X]%']} />
              <TableRow cells={['Label', '$[PRECIO] MXN/mes', '[N]', '[X]%']} />
            </tbody>
          </table>
        </div>
        <HighlightBox type="warning">
          Las suscripciones se renuevan automáticamente. Cancela con al menos 24 horas de anticipación
          desde Configuración → Facturación para evitar el siguiente cargo.
        </HighlightBox>
        <p>
          Las cuotas de suscripción <strong className="text-white">no son reembolsables</strong> una
          vez procesadas, salvo error técnico de cobro o solicitud en las primeras 48 horas de
          la primera suscripción.
        </p>
      </Section>

      <Section title="4. Propiedad Intelectual — Tú Conservas Todo">
        <HighlightBox type="info">
          Zonyd NO adquiere ningún derecho de propiedad sobre tu música. Conservas el 100% de tus
          grabaciones maestras y composiciones.
        </HighlightBox>
        <p>
          Al cargar contenido, otorgas a Zonyd una licencia <strong className="text-white">no exclusiva,
          mundial y libre de regalías</strong> únicamente para distribuir tu música en las tiendas
          digitales seleccionadas. Esta licencia se extingue al retirar el contenido.
        </p>
        <p>
          Declaras y garantizas que eres titular o tienes licencia válida de todos los derechos
          necesarios, incluyendo: master, composición, letras, portada y cualquier sample utilizado.
        </p>
      </Section>

      <Section title="5. Regalías y Pagos">
        <p>
          Zonyd recauda las regalías en tu nombre. Los DSPs reportan con un rezago de{' '}
          <strong className="text-white">60–120 días</strong>. El monto mínimo de retiro es{' '}
          <strong className="text-white">$[MONTO] USD</strong>.
        </p>
        <p>
          Zonyd puede retener temporalmente regalías en caso de disputa de propiedad, investigación
          por fraude, o requerimiento legal.
        </p>
        <p>
          Los fondos inactivos por más de <strong className="text-white">24 meses</strong> serán
          tratados conforme a la legislación aplicable en materia de recursos abandonados.
        </p>
      </Section>

      <Section title="6. Contenido Prohibido">
        <p>Está prohibido cargar contenido que:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Infrinja derechos de autor o marcas de terceros</li>
          <li>Contenga discurso de odio o incitación a la violencia</li>
          <li>Incluya material de explotación sexual de menores (CSAM)</li>
          <li>Promueva actividades ilegales o terrorismo</li>
          <li>Contenga metadatos falsos o engañosos</li>
        </ul>
      </Section>

      <Section title="7. Anti-Fraude — Streams Artificiales">
        <HighlightBox type="important">
          Está PROHIBIDO usar bots, click farms o servicios para inflar reproducciones artificialmente.
          Las penalizaciones de Spotify (€10/track) serán trasladadas directamente a tu cuenta.
        </HighlightBox>
        <p>
          Zonyd implementa un sistema de 4 niveles de sanción: advertencia → retención de regalías →
          retiro del contenido → suspensión permanente.
        </p>
      </Section>

      <Section title="8. Terminación de Cuenta">
        <p>
          Puedes cancelar tu cuenta en cualquier momento. Zonyd puede suspender o terminar cuentas por:
          violación de términos, fraude, incumplimiento de pago, o requerimiento legal.
        </p>
        <p>
          Tras la terminación, los saldos disponibles superiores al mínimo serán pagados en los
          siguientes 30 días, previa verificación de identidad.
        </p>
      </Section>

      <Section title="9. Indemnización">
        <p>
          Aceptas defender e indemnizar a Zonyd por reclamaciones, pérdidas y costos (incluyendo
          honorarios de abogados) derivados de: el contenido que cargas, violación de estos Términos,
          infracción de derechos de terceros, o actividad fraudulenta.
        </p>
      </Section>

      <Section title="10. Limitación de Responsabilidad">
        <p>
          La responsabilidad total de Zonyd no excederá el{' '}
          <strong className="text-white">monto pagado en los 6 meses anteriores</strong> al evento.
          Zonyd no será responsable por daños indirectos, pérdida de ingresos o daño reputacional.
        </p>
      </Section>

      <Section title="11. Ley Aplicable">
        <p>
          Estos Términos se rigen por las leyes de los{' '}
          <strong className="text-white">Estados Unidos Mexicanos</strong>. Las disputas se resolverán
          en los tribunales de <strong className="text-white">[CIUDAD, ESTADO]</strong>.
        </p>
        <p>
          Zonyd notificará cambios materiales con al menos{' '}
          <strong className="text-white">30 días de anticipación</strong> por email.
        </p>
      </Section>

      <div className="mt-8 p-4 rounded-xl bg-[#151821] border border-[#232733] text-xs text-[#A1A1AA] text-center">
        Entidad responsable: <strong className="text-white">[RAZÓN SOCIAL COMPLETA, S.A.P.I. de C.V.]</strong>
        {' · '} <a href="mailto:legal@zonyd.com" className="text-[#4F8CFF] hover:underline">legal@zonyd.com</a>
        {' · '} <a href="[DIRECCIÓN]" className="text-[#4F8CFF] hover:underline">[DIRECCIÓN COMPLETA]</a>
      </div>
    </LegalPageLayout>
  );
}
