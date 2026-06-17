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
    <div className="flex items-center gap-2 px-6 py-4 max-w-xl mx-auto" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps} aria-label="Flow progress">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: clientConfig.brandPrimaryColor }}
        />
      </div>
      <span className="text-xs text-gray-500 font-medium min-w-[3rem] text-right">
        {currentStep + 1} / {totalSteps}
      </span>
    </div>
  );
}