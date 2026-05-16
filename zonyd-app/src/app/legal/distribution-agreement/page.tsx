import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Acuerdo de Distribución — Zonyd',
  description: 'Contrato específico para distribuir tu música a través de Zonyd a los DSPs globales.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#232733]">{title}</h2>
      <div className="space-y-3 text-sm text-[#C1C1C8] leading-relaxed">{children}</div>
    </section>
  );
}

const dsps = [
  'Spotify', 'Apple Music / iTunes', 'Amazon Music', 'YouTube Music',
  'Deezer', 'TikTok / TikTok Music', 'Instagram / Facebook (Meta)',
  'Tidal', 'Pandora', 'Napster', 'iHeartRadio', 'Boomplay', 'Anghami',
];

const warranties = [
  'Eres titular o tienes licencia completa de todos los derechos (master, composición, portada)',
  'El contenido no infringe derechos de terceros',
  'Si hay samples, cuentas con las licencias correspondientes',
  'El contenido generado con IA cuenta con derechos de distribución comercial',
  'No promoverás streams artificiales',
  'Todos los metadatos son verídicos y completos',
  'Los derechos no están sujetos a disputas o gravámenes',
];

export default function DistributionAgreementPage() {
  return (
    <LegalPageLayout
      icon="🎵"
      title="Acuerdo de Distribución Musical"
      subtitle="Contrato que aceptas al enviar tu primer lanzamiento a distribución a través de Zonyd."
      lastUpdated="[DD/MM/AAAA]"
      version="1.0"
    >
      <div className="mb-8 p-4 rounded-xl bg-[rgba(255,159,10,0.08)] border border-[rgba(255,159,10,0.25)] text-sm text-[#FF9F0A]">
        ⚠️ Este Acuerdo entra en vigor cuando haces clic en "Distribuir mi lanzamiento". Complementa
        los Términos y Condiciones Generales.
      </div>

      <Section title="1. Objeto del Acuerdo">
        <p>
          Mediante este Acuerdo, autorizas a Zonyd a actuar como tu{' '}
          <strong className="text-white">distribuidor digital no-exclusivo</strong> para los
          lanzamientos que envíes a distribución a través de la plataforma.
        </p>
      </Section>

      <Section title="2. Tiendas Digitales Incluidas">
        <div className="flex flex-wrap gap-2 mb-4">
          {dsps.map((dsp) => (
            <span key={dsp} className="text-xs px-3 py-1.5 rounded-full bg-[#151821] border border-[#232733] text-[#C1C1C8]">
              {dsp}
            </span>
          ))}
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#151821] border border-[#232733] text-[#A1A1AA]">
            + más plataformas
          </span>
        </div>
        <p>
          Puedes excluir tiendas específicas desde la configuración de cada lanzamiento.
          La distribución es <strong className="text-white">Worldwide</strong> por defecto,
          con opción de seleccionar territorios específicos.
        </p>
      </Section>

      <Section title="3. Licencia que Nos Otorgas">
        <p>
          Nos otorgas una licencia <strong className="text-white">no exclusiva, mundial y libre de
          regalías</strong> para:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Reproducir y almacenar el contenido en nuestros sistemas</li>
          <li>Transcodificar el audio a formatos requeridos por cada DSP</li>
          <li>Distribuir y poner a disposición del público en las tiendas</li>
          <li>Crear y entregar paquetes DDEX ERN en tu nombre</li>
          <li>Cobrar regalías en tu nombre de los DSPs</li>
          <li>Usar tu nombre artístico y portada para identificar el contenido</li>
        </ul>
        <p className="mt-3 text-[#A1A1AA] text-xs">
          Esta licencia NO incluye: venta a terceros para otros propósitos, sincronización
          audiovisual (requiere acuerdo adicional), ni titularidad de tus derechos.
        </p>
      </Section>

      <Section title="4. Códigos ISRC y UPC">
        <p>
          Zonyd asignará a cada lanzamiento los códigos de identificación de la industria:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="p-4 rounded-xl bg-[#151821] border border-[#232733]">
            <p className="text-xs font-semibold text-[#FF9F0A] mb-1">UPC</p>
            <p className="text-sm text-[#C1C1C8]">Código de barras único del lanzamiento (12–13 dígitos). Identifica el álbum o single.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#151821] border border-[#232733]">
            <p className="text-xs font-semibold text-[#4F8CFF] mb-1">ISRC</p>
            <p className="text-sm text-[#C1C1C8]">Código único por track (ISO 3901). Esencial para rastreo de regalías globalmente.</p>
          </div>
        </div>
        <p className="mt-3">
          Estos códigos son tuyos. Si cambias de distribuidor, Zonyd te proporcionará una exportación
          de todos tus códigos para mantener la continuidad del historial de streaming.
        </p>
      </Section>

      <Section title="5. Requisitos Técnicos">
        <div className="overflow-x-auto rounded-xl border border-[#232733] mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1f2e]">
                <th className="px-4 py-3 text-left text-xs text-[#A1A1AA] font-semibold">Parámetro</th>
                <th className="px-4 py-3 text-left text-xs text-[#A1A1AA] font-semibold">Requerido</th>
                <th className="px-4 py-3 text-left text-xs text-[#A1A1AA] font-semibold">Recomendado</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Formato de audio', 'WAV o MP3 320kbps', 'WAV 24-bit'],
                ['Sample Rate', '44,100 Hz', '44,100 Hz'],
                ['Normalización LUFS', 'Zonyd la aplica automáticamente', '-14 LUFS'],
                ['Duración mínima', '30 segundos', '—'],
                ['Portada', '3,000 × 3,000 px JPG/PNG RGB', '3,000 × 3,000 px'],
              ].map(([param, req, rec], i) => (
                <tr key={i} className="border-t border-[#232733] hover:bg-[#151821] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">{param}</td>
                  <td className="px-4 py-3 text-sm text-[#C1C1C8]">{req}</td>
                  <td className="px-4 py-3 text-sm text-[#A1A1AA]">{rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="6. Comisiones">
        <p>
          La comisión de Zonyd se aplica según el plan activo al momento de la distribución
          (ver Política de Suscripciones para porcentajes exactos). El resto se abona a tu
          Cartera Zonyd.
        </p>
        <p>
          Para YouTube Content ID, aplica una comisión adicional del{' '}
          <strong className="text-white">[X]%</strong> sobre los ingresos de ese canal.
        </p>
      </Section>

      <Section title="7. Tus Declaraciones y Garantías">
        <p className="mb-3">Al distribuir, declaras y garantizas que:</p>
        <ul className="space-y-2">
          {warranties.map((w, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#34C759] mt-0.5 flex-shrink-0">✓</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="8. Retiro de Contenido y Portabilidad">
        <p>
          Puedes solicitar el retiro de cualquier lanzamiento en cualquier momento desde la plataforma.
          Procesaremos la solicitud en <strong className="text-white">2–5 días hábiles</strong>.
          El retiro efectivo en cada tienda puede tomar hasta 30 días adicionales.
        </p>
        <p>
          Al retirar tu contenido, puedes redistribuirlo a través de otro distribuidor usando
          los <strong className="text-white">mismos ISRC y UPC</strong> para mantener el historial de streaming.
        </p>
        <p>
          Las regalías ya generadas durante el período activo continuarán procesándose y siendo pagadas.
        </p>
      </Section>

      <div className="mt-8 p-5 rounded-2xl bg-[#151821] border border-[#232733] text-xs text-[#A1A1AA]">
        <p className="mb-1">
          <strong className="text-white">Al hacer clic en "Distribuir mi lanzamiento"</strong>, confirmas
          haber leído y aceptado este Acuerdo.
        </p>
        <p>Fecha de aceptación, IP y versión del Acuerdo son registrados automáticamente.</p>
      </div>
    </LegalPageLayout>
  );
}
