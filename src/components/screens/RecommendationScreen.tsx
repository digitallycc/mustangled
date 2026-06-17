"use client";

import type { PresalesInput, Recommendation } from "@/lib/types";
import { clientConfig } from "@/config/client";
import { getCTALabel } from "@/lib/recommendation";
import {
  getUseCaseLabel,
  getEnvironmentLabel,
  getSizeCategoryLabel,
} from "@/lib/whatsapp";

interface RecommendationScreenProps {
  input: PresalesInput;
  recommendation: Recommendation;
  onWhatsAppHandoff: () => void;
  onRestart: () => void;
  isSubmitting: boolean;
}

export default function RecommendationScreen({
  input,
  recommendation,
  onWhatsAppHandoff,
  onRestart,
  isSubmitting,
}: RecommendationScreenProps) {
  const ctaLabel = getCTALabel(recommendation.type);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-shrink-0 px-6 pt-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {recommendation.title}
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          {recommendation.explanation}
        </p>
      </div>

      <div className="flex-1 px-6 overflow-y-auto min-h-0 mt-3">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 rounded-xl p-4 mb-3">
            <h2 className="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wider">
              Your Selections
            </h2>
            <div className="space-y-2">
              {[
                { label: "Use case", value: getUseCaseLabel(input.useCase) },
                { label: "Installation", value: getEnvironmentLabel(input.environment) },
                { label: "Size", value: getSizeCategoryLabel(input.sizeCategory) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 border-2 border-gray-100 bg-gray-50 mb-3">
            <div className="mb-1.5">
              <span className="text-sm font-semibold text-gray-700">
                Next Step
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {recommendation.suggestedNextStep}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-5 pt-2">
        <div className="max-w-md mx-auto space-y-2">
          <button
            type="button"
            onClick={onWhatsAppHandoff}
            disabled={isSubmitting}
            className="w-full py-[14px] px-6 text-base font-semibold text-white rounded-xl transition-all hover:opacity-90 active:scale-[0.98] touch-manipulation flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: clientConfig.brandPrimaryColor }}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending your recommendation...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {ctaLabel}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRestart}
            disabled={isSubmitting}
            className="w-full py-3 px-6 text-sm font-medium text-gray-600 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all touch-manipulation disabled:opacity-50"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
