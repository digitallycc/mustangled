"use client";

import { clientConfig } from "@/config/client";

type UseCaseOption =
  | "shop_retail"
  | "restaurant_menu"
  | "outdoor_advertising"
  | "office_meeting"
  | "event_stage"
  | "not_sure";

interface UseCaseScreenProps {
  selectedUseCase: UseCaseOption | null;
  onUseCaseChange: (value: UseCaseOption) => void;
  onNext: () => void;
  onBack: () => void;
  reassurance: string;
}

const useCaseOptions: { value: UseCaseOption; label: string; icon: string }[] = [
  { value: "shop_retail", label: "Shop / Retail", icon: "🛍" },
  { value: "restaurant_menu", label: "Restaurant Menu", icon: "🍽" },
  { value: "outdoor_advertising", label: "Outdoor Advertising", icon: "📢" },
  { value: "office_meeting", label: "Office / Meeting Room", icon: "🏢" },
  { value: "event_stage", label: "Event / Stage", icon: "🎤" },
  { value: "not_sure", label: "Not Sure", icon: "🤔" },
];

export default function UseCaseScreen({
  selectedUseCase,
  onUseCaseChange,
  onNext,
  onBack,
  reassurance,
}: UseCaseScreenProps) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
      <div className="flex-shrink-0 px-6 pt-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-float-up">
          What do you need the screen for?
        </h1>
        <p className="text-gray-600 text-sm animate-float-up stagger-1">
          Pick the option that best describes your setup.
        </p>
      </div>

      <div className="flex-1 px-6 overflow-y-auto min-h-0 mt-3">
        <div className="max-w-md mx-auto space-y-2.5">
          {useCaseOptions.map((option, i) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUseCaseChange(option.value)}
              className={`w-full px-4 py-[14px] text-left text-base font-medium rounded-2xl border-2 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 option-card animate-float-up ${
                selectedUseCase === option.value
                  ? "border-green-500 bg-green-50/80 ring-green-200 option-card-selected"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="funnel-actions flex-shrink-0 px-6 pt-2">
        <div className="max-w-md mx-auto">
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1.5 mb-3">
            <svg className="w-4 h-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3 3a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
            </svg>
            {reassurance}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-shrink-0 px-5 py-[14px] text-sm font-medium text-gray-600 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all touch-manipulation btn-secondary"
            >
              Back
            </button>
            <button
              onClick={onNext}
              disabled={!selectedUseCase}
              className="flex-1 py-[14px] px-6 text-base font-semibold text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation btn-primary"
              style={{ backgroundColor: clientConfig.brandPrimaryColor }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
