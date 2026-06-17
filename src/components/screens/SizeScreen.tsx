"use client";

import { clientConfig } from "@/config/client";

type SizeOption =
  | "small"
  | "medium"
  | "large"
  | "very_large_billboard"
  | "not_sure";

interface SizeScreenProps {
  selectedSize: SizeOption | null;
  onSizeChange: (value: SizeOption) => void;
  onNext: () => void;
  onBack: () => void;
  reassurance: string;
}

const sizeOptions: { value: SizeOption; label: string; icon: string; hint: string }[] = [
  { value: "small", label: "Small", icon: "📱", hint: "Up to 6 ft" },
  { value: "medium", label: "Medium", icon: "📺", hint: "6–12 ft" },
  { value: "large", label: "Large", icon: "🖥", hint: "12–25 ft" },
  { value: "very_large_billboard", label: "Very Large / Billboard", icon: "🎬", hint: "25+ ft" },
  { value: "not_sure", label: "Not Sure", icon: "🤔", hint: "We'll help you decide" },
];

export default function SizeScreen({
  selectedSize,
  onSizeChange,
  onNext,
  onBack,
  reassurance,
}: SizeScreenProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-shrink-0 px-6 pt-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-float-up">
          Roughly how big should it be?
        </h1>
        <p className="text-gray-600 text-sm animate-float-up stagger-1">
          Don&apos;t worry about exact measurements — a rough idea is enough.
        </p>
      </div>

      <div className="flex-1 px-6 overflow-y-auto min-h-0 mt-3">
        <div className="max-w-md mx-auto space-y-2.5">
          {sizeOptions.map((option, i) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSizeChange(option.value)}
              className={`w-full px-4 py-3.5 text-left text-base font-medium rounded-2xl border-2 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 option-card animate-float-up ${
                selectedSize === option.value
                  ? "border-green-500 bg-green-50/80 ring-green-200 option-card-selected"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{option.hint}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-5 pt-2">
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
              disabled={!selectedSize}
              className="flex-1 py-[14px] px-6 text-base font-semibold text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation btn-primary"
              style={{ backgroundColor: clientConfig.brandPrimaryColor }}
            >
              See My Recommendation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}