import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Política de Copyright y Anti-Fraude — Zonyd',
  description: 'Procedimiento DMCA, sistema de strikes, política anti-streaming artificial y contenido prohibido.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#232733]">{title}</h2>
      <div className="space-y-3 text-sm text-[#C1C1C8] leading-relaxed">{children}</div>
    </section>
  );
}

export default function CopyrightPage() {
  return (
    <LegalPageLayout
      icon="⚖️"
      title="Política de Copyright y Anti-Fraude"
      subtitle="Procedimiento DMCA, sistema de strikes y política de tolerancia cero ante streaming artificial."
      lastUpdated="[DD/MM/AAAA]"
      version="1.0"
    >
      {/* ── PARTE I: COPYRIGHT ── */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#232733]" />
        <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest">Parte I — Derechos de Autor</span>
        <div className="h-px flex-1 bg-[#232733]" />
      </div>

      <Section title="1. Tu Responsabilidad como Artista">
        <p>Es tu responsabilidad exclusiva poseer o haber licenciado:</p>
        <ul className="space-y-2 mt-2">
          {[
            ['🎵', 'Derechos sobre la grabación maestra (master rights)'],
            ['🎼', 'Derechos sobre la composición musical (melodía + letra)'],
            ['🖼️', 'Derechos sobre el arte de portada'],
            ['🎹', 'Licencias de samples, interpolaciones o fragmentos de obras ajenas'],
          ].map(([icon, text]) => (
            <li key={text} className="flex items-start gap-2">
              <span className="flex-shrink-0">{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 p-4 rounded-xl bg-[rgba(255,159,10,0.08)] border border-[rgba(255,159,10,0.25)] text-[#FF9F0A] text-sm">
          ⚠️ <strong>Covers:</strong> Distribuir una versión de canción ajena requiere una{' '}
          <strong>licencia mecánica</strong>. El crédito al compositor NO es suficiente.
        </div>
      </Section>

      <Section title="2. Notificación DMCA de Infracción">
        <p>Si eres titular de derechos y crees que tu contenido está siendo infringido:</p>

        <div className="mt-4 space-y-3">
          {[
            ['1', 'Identificar la obra protegida (artista, título, ISRC/UPC)'],
            ['2', 'Identificar el material infractor en Zonyd (artista, título, URL)'],
            ['3', 'Incluir tus datos de contacto completos'],
            ['4', 'Declarar de buena fe que el uso no está autorizado'],
            ['5', 'Declarar, bajo pena de perjurio, que la información es exacta'],
            ['6', 'Firmar la notificación (física o electrónica)'],
          ].map(([num, text]) => (
            <div key={num} className="flex items-start gap-3 p-3 rounded-xl bg-[#151821] border border-[#232733]">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF9F0A] text-black text-xs font-bold flex items-center justify-center">
                {num}
              </span>
              <span className="text-sm text-[#C1C1C8]">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-[#151821] border border-[#232733]">
          <p className="text-xs font-semibold text-[#A1A1AA] mb-2">Enviar a:</p>
          <p className="text-sm text-white">
            📧{' '}
            <a href="mailto:copyright@zonyd.com" className="text-[#4F8CFF] hover:underline">
              copyright@zonyd.com
            </a>
          </p>
          <p className="text-sm text-white mt-1">
            📮 [RAZÓN SOCIAL] · Attn: Agente DMCA · [DIRECCIÓN COMPLETA]
          </p>
          <p className="text-xs text-[#A1A1AA] mt-2">Asunto: "DMCA Notice — [Artista] — [Título]"</p>
        </div>
      </Section>

      <Section title="3. Contra-Notificación">
        <p>
          Si tu contenido fue retirado por error, puedes presentar una contra-notificación a{' '}
          <a href="mailto:copyright@zonyd.com" className="text-[#4F8CFF] hover:underline">
            copyright@zonyd.com
          </a>
          . Si el reclamante no presenta acción legal en{' '}
          <strong className="text-white">10 días hábiles</strong>, Zonyd podrá restaurar tu contenido.
        </p>
      </Section>

      <Section title="4. Sistema de Strikes por Infracción de Copyright">
        <div className="space-y-3 mt-2">
          {[
            { strike: 'Strike 1', color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)', border: 'rgba(255,159,10,0.25)', consequence: 'Advertencia formal + retiro del contenido específico' },
            { strike: 'Strike 2', color: '#FF6B35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.25)', consequence: 'Suspensión temporal de la cuenta (30 días) + retiro del contenido' },
            { strike: 'Strike 3', color: '#FF453A', bg: 'rgba(255,69,58,0.08)', border: 'rgba(255,69,58,0.25)', consequence: 'Suspensión PERMANENTE de la cuenta + retención de saldos' },
          ].map(({ strike, color, bg, border, consequence }) => (
            <div
              key={strike}
              style={{ background: bg, borderColor: border, color }}
              className="flex items-center gap-4 p-4 rounded-xl border"
            >
              <span className="font-bold text-sm flex-shrink-0">{strike}</span>
              <span className="text-sm text-[#C1C1C8]">{consequence}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#A1A1AA] mt-3">
          Los 3 strikes se cuentan en un período de 12 meses consecutivos.
          Las notificaciones que resulten en contra-notificación exitosa no cuentan como strike.
        </p>
      </Section>

      {/* ── PARTE II: ANTI-FRAUDE ── */}
      <div className="my-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#232733]" />
        <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest">Parte II — Anti-Fraude</span>
        <div className="h-px flex-1 bg-[#232733]" />
      </div>

      <Section title="5. Streaming Artificial — Prohibición Absoluta">
        <div className="p-4 rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.25)] text-[#FF453A] text-sm mb-4">
          🚨 <strong>Tolerancia cero.</strong> Usar bots, click farms o servicios de streams pagados
          es motivo de suspensión permanente inmediata.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['Bots y scripts', 'Automatización para generar reproducciones'],
            ['Click farms', 'Granjas de dispositivos para inflar métricas'],
            ['Playlists de pago fraudulento', 'Pagar por inclusión que genere streams falsos'],
            ['Stream farming organizado', 'Grupos coordinados de streams recíprocos'],
            ['Metadata fraud', 'Atribución falsa de autoría o créditos'],
            ['Identity fraud', 'Distribuir como otro artista para confundir'],
          ].map(([title, desc]) => (
            <div key={title} className="p-3 rounded-xl bg-[#151821] border border-[#232733]">
              <p className="text-xs font-semibold text-[#FF453A] mb-1">{title}</p>
              <p className="text-xs text-[#A1A1AA]">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="6. Consecuencias del Fraude Detectado">
        <div className="space-y-3">
          {[
            { nivel: 'Nivel 1', label: 'Advertencia', color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)', border: 'rgba(255,159,10,0.25)', desc: 'Primer indicio sospechoso. Notificación al artista + solicitud de explicación.' },
            { nivel: 'Nivel 2', label: 'Retención', color: '#FF6B35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.25)', desc: 'Fraude confirmado. Retención de regalías del período afectado.' },
            { nivel: 'Nivel 3', label: 'Retiro', color: '#FF453A', bg: 'rgba(255,69,58,0.08)', border: 'rgba(255,69,58,0.25)', desc: 'Reincidencia. Retiro inmediato del contenido de todos los DSPs.' },
            { nivel: 'Nivel 4', label: 'Suspensión', color: '#BF3E3E', bg: 'rgba(191,62,62,0.12)', border: 'rgba(191,62,62,0.3)', desc: 'Fraude masivo o múltiple. Suspensión permanente + retención total de saldos fraudulentos.' },
          ].map(({ nivel, label, color, bg, border, desc }) => (
            <div key={nivel} style={{ background: bg, borderColor: border }} className="flex gap-4 p-4 rounded-xl border">
              <div className="flex-shrink-0 text-center">
                <p style={{ color }} className="text-xs font-bold">{nivel}</p>
                <p style={{ color }} className="text-xs">{label}</p>
              </div>
              <p className="text-sm text-[#C1C1C8]">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.25)] text-sm">
          <p className="text-[#FF453A] font-semibold mb-1">Penalización Spotify 2024</p>
          <p className="text-[#C1C1C8]">
            Spotify cobra <strong className="text-white">€10 por track</strong> con streaming artificial
            "flagrante". Esta penalización es trasladada <strong className="text-white">íntegramente</strong> a
            tu cuenta y descontada de tu saldo.
          </p>
        </div>
      </Section>

      <Section title="7. Reporte de Fraude">
        <p>
          Si tienes conocimiento de actividad fraudulenta en la plataforma, repórtala de forma
          confidencial a{' '}
          <a href="mailto:trust@zonyd.com" className="text-[#4F8CFF] hover:underline">
            trust@zonyd.com
          </a>
        </p>
      </Section>
    </LegalPageLayout>
  );
}
