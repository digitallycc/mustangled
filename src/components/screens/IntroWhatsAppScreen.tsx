"use client";

import { clientConfig } from "@/config/client";

interface IntroWhatsAppScreenProps {
  whatsappNumber: string;
  onWhatsAppChange: (value: string) => void;
  onNext: () => void;
  canContinue: boolean;
  error: string;
  privacyReassurance: string;
  isSubmitting: boolean;
}

export default function IntroWhatsAppScreen({
  whatsappNumber,
  onWhatsAppChange,
  onNext,
  canContinue,
  error,
  privacyReassurance,
  isSubmitting,
}: IntroWhatsAppScreenProps) {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWhatsAppChange(e.target.value);
  };
  const displayError = error;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-shrink-0 hero-gradient rounded-b-3xl mx-4 mt-0 mb-4 pt-6 pb-8 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ background: clientConfig.brandPrimaryColor }} />
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-float-up">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-float-up stagger-1">
            Find the right LED screen for your space
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed animate-float-up stagger-2">
            Answer 3 quick questions and get a recommendation on WhatsApp. No tech
            knowledge needed.
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 overflow-y-auto min-h-0">
        <div className="max-w-md mx-auto">
          <label
            htmlFor="whatsapp-number"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Where should we send your recommendation?
          </label>
          <p className="text-sm text-gray-500 mb-3">
            We&apos;ll text you the results on WhatsApp right here.
          </p>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <span className="text-base font-semibold text-gray-500">+</span>
              <div className="w-px h-4 bg-gray-300" />
            </div>
            <input
              id="whatsapp-number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={whatsappNumber}
              onChange={handleInput}
              onKeyDown={(e) =>
                e.key === "Enter" && canContinue && !isSubmitting && onNext()
              }
              placeholder="92 3XX XXX XXXX"
              disabled={isSubmitting}
              className={`w-full pl-16 pr-4 py-[14px] text-base border-2 rounded-2xl bg-white
                ${displayError ? "border-red-400 bg-red-50/50" : "border-gray-200"}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-200
                transition-all disabled:opacity-60 disabled:cursor-not-allowed input-focus-ring`}
              aria-invalid={!!displayError}
              aria-describedby={
                displayError ? "whatsapp-error" : "whatsapp-hint"
              }
            />
            <span
              id="whatsapp-hint"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium"
            >
              Country code
            </span>
          </div>

          {displayError && (
            <p
              id="whatsapp-error"
              className="mt-2 text-sm text-red-600 flex items-center gap-1.5 animate-fade-in"
              role="alert"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {displayError}
            </p>
          )}

          <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
            <svg
              className="w-4 h-4 flex-shrink-0 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3 3a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06l-3-3z"
                clipRule="evenodd"
              />
            </svg>
            {privacyReassurance}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-5 pt-2">
        <div className="max-w-md mx-auto">
          <button
            onClick={onNext}
            disabled={!canContinue || isSubmitting}
            className="w-full py-[14px] px-6 text-base font-semibold text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2 btn-primary"
            style={{ backgroundColor: clientConfig.brandPrimaryColor }}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking your WhatsApp number...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
