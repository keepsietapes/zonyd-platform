import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Política de Privacidad — Zonyd',
  description: 'Cómo Zonyd recopila, usa y protege tus datos personales. Cumplimiento LFPDPPP y GDPR.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#232733]">{title}</h2>
      <div className="space-y-3 text-sm text-[#C1C1C8] leading-relaxed">{children}</div>
    </section>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#232733] mb-4">
      <table className="w-full">
        <thead>
          <tr className="bg-[#1a1f2e]">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs text-[#A1A1AA] font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[#232733] hover:bg-[#151821] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-[#C1C1C8]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      icon="🔒"
      title="Política de Privacidad"
      subtitle="Cómo recopilamos, usamos y protegemos tus datos personales. Cumplimiento LFPDPPP y GDPR."
      lastUpdated="[DD/MM/AAAA]"
      version="1.0"
    >
      <div className="mb-8 p-4 rounded-xl bg-[rgba(79,140,255,0.08)] border border-[rgba(79,140,255,0.25)] text-sm text-[#4F8CFF]">
        ℹ️ Este Aviso se emite en cumplimiento de la <strong>LFPDPPP</strong> (México) y los principios
        del <strong>GDPR</strong> (Unión Europea), en lo aplicable.
      </div>

      <Section title="1. Responsable del Tratamiento">
        <p>
          <strong className="text-white">[RAZÓN SOCIAL COMPLETA, S.A.P.I. de C.V.]</strong><br />
          RFC: [RFC] · Domicilio: [DIRECCIÓN COMPLETA]<br />
          Correo de privacidad:{' '}
          <a href="mailto:privacidad@zonyd.com" className="text-[#4F8CFF] hover:underline">
            privacidad@zonyd.com
          </a>
        </p>
      </Section>

      <Section title="2. Datos que Recopilamos">
        <DataTable
          headers={['Categoría', 'Datos', 'Finalidad']}
          rows={[
            ['Identificación', 'Nombre, nombre artístico, fecha de nacimiento', 'Crear y gestionar tu cuenta'],
            ['Contacto', 'Email, teléfono', 'Comunicaciones, soporte, notificaciones'],
            ['Fiscales', 'RFC, CLABE, cuenta bancaria', 'Pago de regalías, cumplimiento fiscal'],
            ['KYC', 'ID oficial, comprobante de domicilio', 'Verificación de identidad, anti-fraude'],
            ['Contenido artístico', 'Audio, portadas, letras, metadatos', 'Prestar el servicio de distribución'],
            ['Técnicos', 'IP, navegador, dispositivo', 'Seguridad y diagnóstico'],
            ['Uso', 'Páginas visitadas, acciones', 'Mejora del servicio'],
          ]}
        />
      </Section>

      <Section title="3. Finalidades del Tratamiento">
        <p className="font-medium text-white mb-2">Primarias (necesarias para el servicio):</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mb-4">
          <li>Crear y gestionar tu cuenta</li>
          <li>Prestar el servicio de distribución musical</li>
          <li>Gestionar regalías y pagos</li>
          <li>Cumplimiento de obligaciones legales y fiscales</li>
          <li>Verificar tu identidad (KYC) y prevenir fraude</li>
          <li>Gestionar disputas de propiedad intelectual</li>
        </ul>
        <p className="font-medium text-white mb-2">Secundarias (opcionales — requieren consentimiento):</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Comunicaciones de marketing</li>
          <li>Encuestas de satisfacción</li>
          <li>Personalización de la experiencia</li>
        </ul>
        <p className="mt-3 text-[#A1A1AA] text-xs">
          Puedes revocar tu consentimiento para finalidades secundarias en Configuración → Privacidad.
        </p>
      </Section>

      <Section title="4. Proveedores y Terceros">
        <DataTable
          headers={['Proveedor', 'Propósito', 'Garantías']}
          rows={[
            ['Supabase', 'Base de datos y autenticación', 'SOC 2 Type II, GDPR'],
            ['Stripe / PayPal', 'Procesamiento de pagos', 'PCI DSS Level 1'],
            ['Sentry', 'Monitoreo de errores (datos anónimos)', 'GDPR'],
            ['[Partner Distribución]', 'Distribución a DSPs', 'Acuerdo de procesamiento de datos'],
          ]}
        />
        <p>
          También compartimos metadatos de tus lanzamientos con las Tiendas Digitales (Spotify, Apple
          Music, etc.) para prestar el servicio de distribución.
        </p>
      </Section>

      <Section title="5. Tus Derechos ARCO">
        <DataTable
          headers={['Derecho', 'Descripción']}
          rows={[
            ['Acceso', 'Conocer qué datos tenemos sobre ti y cómo los usamos'],
            ['Rectificación', 'Corregir datos inexactos o incompletos'],
            ['Cancelación', 'Solicitar la eliminación de tus datos cuando ya no sean necesarios'],
            ['Oposición', 'Oponerte al tratamiento para finalidades específicas'],
          ]}
        />
        <p>
          Envía tu solicitud a{' '}
          <a href="mailto:privacidad@zonyd.com" className="text-[#4F8CFF] hover:underline">
            privacidad@zonyd.com
          </a>{' '}
          con tu nombre, email registrado y copia de identificación oficial.
          Responderemos en un máximo de <strong className="text-white">20 días hábiles</strong>.
        </p>
        <p className="mt-3">
          <strong className="text-white">Usuarios de la UE:</strong> También tienes derecho a
          portabilidad de datos, limitación del tratamiento y presentar reclamación ante la autoridad
          de protección de datos de tu país.
        </p>
      </Section>

      <Section title="6. Retención de Datos">
        <DataTable
          headers={['Categoría', 'Período']}
          rows={[
            ['Datos de cuenta activa', 'Mientras la cuenta esté activa + 2 años'],
            ['Datos financieros y fiscales', '5 años (obligación legal)'],
            ['Registros de distribución', '7 años (resolución de disputas)'],
            ['Logs de auditoría', '3 años'],
            ['Cookies analíticas', '13 meses máximo'],
          ]}
        />
      </Section>

      <Section title="7. Seguridad">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Cifrado en tránsito: TLS 1.2+</li>
          <li>Cifrado en reposo: AES-256</li>
          <li>Autenticación: JWT firmados via Supabase Auth</li>
          <li>Control de acceso: RBAC para personal interno</li>
          <li>Backups automáticos diarios con retención de 30 días</li>
        </ul>
      </Section>

      <Section title="8. Menores de Edad">
        <p>
          Los servicios de Zonyd <strong className="text-white">no están dirigidos a menores de 18 años</strong>.
          No recopilamos datos de menores de manera intencional.
        </p>
      </Section>

      <Section title="9. Autoridad Supervisora">
        <p>
          En México: <strong className="text-white">INAI</strong> —{' '}
          <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-[#4F8CFF] hover:underline">
            inai.org.mx
          </a>{' '}
          · Tel: 800 835 4324
        </p>
      </Section>
    </LegalPageLayout>
  );
}
