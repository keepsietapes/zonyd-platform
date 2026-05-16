'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LegalDocument {
  id: string;
  version: string;
  label: string;
  url: string;
  required?: boolean;
}

interface LegalAcceptanceProps {
  documents: LegalDocument[];
  onAccept: (acceptedIds: string[]) => Promise<void>;
  submitLabel?: string;
  context?: 'registration' | 'distribution';
}

const REGISTRATION_DOCS: LegalDocument[] = [
  {
    id: 'terms_and_conditions',
    version: '1.0',
    label: 'He leído y acepto los',
    url: '/legal/terms',
    required: true,
  },
  {
    id: 'privacy_policy',
    version: '1.0',
    label: 'He leído y acepto la',
    url: '/legal/privacy',
    required: true,
  },
  {
    id: 'copyright_policy',
    version: '1.0',
    label: 'Confirmo que mi contenido no viola derechos de autor y acepto la',
    url: '/legal/copyright',
    required: true,
  },
];

const DISTRIBUTION_DOCS: LegalDocument[] = [
  {
    id: 'distribution_agreement',
    version: '1.0',
    label: 'He leído y acepto el',
    url: '/legal/distribution-agreement',
    required: true,
  },
];

const DOC_NAMES: Record<string, string> = {
  terms_and_conditions: 'Términos y Condiciones',
  privacy_policy: 'Política de Privacidad',
  copyright_policy: 'Política de Copyright',
  distribution_agreement: 'Acuerdo de Distribución Musical',
};

/**
 * LegalAcceptanceCheckboxes — Componente reutilizable para aceptación de documentos legales
 * 
 * Uso en registro:
 *   <LegalAcceptanceCheckboxes context="registration" onAccept={handleAccept} />
 * 
 * Uso en distribución:
 *   <LegalAcceptanceCheckboxes context="distribution" onAccept={handleAccept} />
 */
export function LegalAcceptanceCheckboxes({
  documents,
  onAccept,
  submitLabel = 'Continuar',
  context = 'registration',
}: LegalAcceptanceProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(documents.map((d) => [d.id, false]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allRequired = documents
    .filter((d) => d.required)
    .every((d) => checked[d.id]);

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = async () => {
    if (!allRequired) return;
    setLoading(true);
    setError(null);
    try {
      const accepted = documents.filter((d) => checked[d.id]).map((d) => d.id);
      await onAccept(accepted);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar aceptación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <label
          key={doc.id}
          htmlFor={`legal-${doc.id}`}
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            checked[doc.id]
              ? 'bg-[rgba(255,159,10,0.06)] border-[rgba(255,159,10,0.3)]'
              : 'bg-[#151821] border-[#232733] hover:border-[#333a4a]'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            <input
              id={`legal-${doc.id}`}
              type="checkbox"
              checked={checked[doc.id] || false}
              onChange={() => toggle(doc.id)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                checked[doc.id]
                  ? 'bg-[#FF9F0A] border-[#FF9F0A]'
                  : 'border-[#232733] bg-transparent'
              }`}
            >
              {checked[doc.id] && (
                <svg viewBox="0 0 12 9" fill="none" className="w-3 h-3">
                  <path d="M1 4L4.5 7.5L11 1" stroke="#0B0B0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>

          <p className="text-sm text-[#C1C1C8] leading-relaxed">
            {doc.label}{' '}
            <Link
              href={doc.url}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-[#FF9F0A] hover:underline font-medium"
            >
              {DOC_NAMES[doc.id] || doc.id}
            </Link>
            {doc.required && <span className="text-[#FF453A] ml-1">*</span>}
          </p>
        </label>
      ))}

      {error && (
        <p className="text-sm text-[#FF453A] px-1">{error}</p>
      )}

      <button
        id={`legal-accept-btn-${context}`}
        onClick={handleSubmit}
        disabled={!allRequired || loading}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
          allRequired && !loading
            ? 'bg-[#FF9F0A] text-black hover:bg-[#e8900a] active:scale-95'
            : 'bg-[#232733] text-[#A1A1AA] cursor-not-allowed'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Registrando...
          </span>
        ) : (
          submitLabel
        )}
      </button>

      <p className="text-xs text-[#A1A1AA] text-center px-2">
        Los campos marcados con <span className="text-[#FF453A]">*</span> son obligatorios.
        Tu aceptación queda registrada con fecha, hora e IP para cumplimiento legal.
      </p>
    </div>
  );
}

/**
 * Preset: checkboxes para el registro de cuenta
 */
export function RegistrationLegalCheckboxes({
  onAccept,
}: {
  onAccept: (ids: string[]) => Promise<void>;
}) {
  return (
    <LegalAcceptanceCheckboxes
      documents={REGISTRATION_DOCS}
      onAccept={onAccept}
      submitLabel="Crear mi cuenta"
      context="registration"
    />
  );
}

/**
 * Preset: checkboxes para el flujo de distribución
 */
export function DistributionLegalCheckboxes({
  onAccept,
}: {
  onAccept: (ids: string[]) => Promise<void>;
}) {
  return (
    <LegalAcceptanceCheckboxes
      documents={DISTRIBUTION_DOCS}
      onAccept={onAccept}
      submitLabel="Confirmar y Distribuir"
      context="distribution"
    />
  );
}

export { REGISTRATION_DOCS, DISTRIBUTION_DOCS };
