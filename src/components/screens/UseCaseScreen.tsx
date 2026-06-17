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

const useCaseOptions: { value: UseCaseOption; label: string }[] = [
  { value: "shop_retail", label: "Shop / Retail" },
  { value: "restaurant_menu", label: "Restaurant Menu" },
  { value: "outdoor_advertising", label: "Outdoor Advertising" },
  { value: "office_meeting", label: "Office / Meeting Room" },
  { value: "event_stage", label: "Event / Stage" },
  { value: "not_sure", label: "Not Sure" },
];

export default function UseCaseScreen({
  selectedUseCase,
  onUseCaseChange,
  onNext,
  onBack,
  reassurance,
}: UseCaseScreenProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-shrink-0 px-6 pt-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          What do you need the screen for?
        </h1>
        <p className="text-gray-600 text-sm">
          Pick the option that best describes your setup.
        </p>
      </div>

      <div className="flex-1 px-6 overflow-y-auto min-h-0 mt-3">
        <div className="max-w-md mx-auto space-y-2">
          {useCaseOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUseCaseChange(option.value)}
              className={`w-full px-4 py-[14px] text-left text-base font-medium rounded-xl border-2 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedUseCase === option.value
                  ? "border-green-500 bg-green-50 ring-green-200"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-5 pt-2">
        <div className="max-w-md mx-auto">
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1 mb-3">
            <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3 3a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
            </svg>
            {reassurance}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-shrink-0 px-5 py-[14px] text-sm font-medium text-gray-600 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all touch-manipulation"
            >
              Back
            </button>
            <button
              onClick={onNext}
              disabled={!selectedUseCase}
              className="flex-1 py-[14px] px-6 text-base font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
