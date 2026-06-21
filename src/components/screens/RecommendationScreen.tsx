"use client";

import { clientConfig } from "@/config/client";

interface RecommendationScreenProps {
  status: "idle" | "sending" | "success" | "error";
  maskedNumber: string;
  error: string;
  onRetry: () => void;
  onBack: () => void;
  onRestart: () => void;
}

export default function RecommendationScreen({
  status,
  maskedNumber,
  error,
  onRetry,
  onBack,
  onRestart,
}: RecommendationScreenProps) {
  const isSending = status === "sending" || status === "idle";
  const isSuccess = status === "success";

  const heading = isSending
    ? "Sending your recommendation..."
    : isSuccess
      ? "Your recommendation is on its way"
      : "We couldn't send your recommendation";

  const description = isSending
    ? "We are preparing your personalised result and whitepaper for WhatsApp."
    : isSuccess
      ? `We've sent your personalised LED screen recommendation${
          maskedNumber
            ? ` to the WhatsApp number ending in ${maskedNumber.slice(-4)}`
            : " to WhatsApp"
        }. A Mustang LED consultant will be in touch to discuss your requirements and provide a definitive quotation.`
      : error || "Please try again. Your answers have been kept.";

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
      <div className="flex-1 flex items-center px-6 py-8">
        <div className="max-w-md mx-auto w-full text-center">
          <div
            className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg animate-scale-in ${
              status === "error"
                ? "bg-red-500"
                : "bg-gradient-to-br from-green-400 to-green-600"
            }`}
          >
            {isSending ? (
              <span className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSuccess ? (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-2xl font-bold text-white">!</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3 animate-float-up">
            {heading}
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed animate-float-up stagger-1">
            {description}
          </p>

          {isSuccess && (
            <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left animate-float-up stagger-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.5L13.5 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 4v6h6" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    Whitepaper included
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Check WhatsApp for your recommendation and Mustang LED whitepaper.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="funnel-actions flex-shrink-0 px-6 pt-2">
        <div className="max-w-md mx-auto space-y-2.5">
          {status === "error" && (
            <>
              <button
                type="button"
                onClick={onRetry}
                className="w-full py-[14px] px-6 text-base font-semibold text-white rounded-2xl btn-primary"
                style={{ backgroundColor: clientConfig.brandPrimaryColor }}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 btn-secondary"
              >
                Review Answers
              </button>
            </>
          )}

          {isSuccess && (
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 btn-secondary"
            >
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
