"use client";

import { clientConfig } from "@/config/client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const percentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex-shrink-0 px-6 py-4 max-w-xl mx-auto w-full" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps} aria-label="Flow progress">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${clientConfig.brandPrimaryColor}cc, ${clientConfig.brandPrimaryColor})`,
              boxShadow: `0 0 8px ${clientConfig.brandPrimaryColor}40`,
            }}
          />
        </div>
        <span className="text-xs text-gray-400 font-semibold tabular-nums min-w-[3rem] text-right">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
