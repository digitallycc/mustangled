"use client";

import { clientConfig } from "@/config/client";

type EnvironmentOption =
  | "indoor"
  | "outdoor"
  | "semi_outdoor_shopfront"
  | "not_sure";

interface EnvironmentScreenProps {
  selectedEnvironment: EnvironmentOption | null;
  onEnvironmentChange: (value: EnvironmentOption) => void;
  onNext: () => void;
  onBack: () => void;
  reassurance: string;
}

const environmentOptions: { value: EnvironmentOption; label: string }[] = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "semi_outdoor_shopfront", label: "Shopfront / Semi-outdoor" },
  { value: "not_sure", label: "Not Sure" },
];

export default function EnvironmentScreen({
  selectedEnvironment,
  onEnvironmentChange,
  onNext,
  onBack,
  reassurance,
}: EnvironmentScreenProps) {
  return (
    <div className="flex-1 flex flex-col justify-center px-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Where will it be installed?
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          This helps us recommend the right brightness and build.
        </p>
      </header>

      <div className="w-full max-w-md mx-auto space-y-3">
        {environmentOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onEnvironmentChange(option.value)}
            className={`w-full px-5 py-5 text-left text-base font-medium rounded-xl border-2 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedEnvironment === option.value
                ? "border-green-500 bg-green-50 ring-green-200"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}

        <p className="mt-4 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3 3a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06l-3-3z"
              clipRule="evenodd"
            />
          </svg>
          {reassurance}
        </p>

        <button
          onClick={onNext}
          disabled={!selectedEnvironment}
          className="mt-4 w-full py-4 px-6 text-base font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          style={{ backgroundColor: clientConfig.brandPrimaryColor }}
        >
          Next
        </button>
      </div>
    </div>
  );
}