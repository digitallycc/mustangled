"use client";

import { useState } from "react";
import { clientConfig } from "@/config/client";

interface IntroWhatsAppScreenProps {
  whatsappNumber: string;
  onWhatsAppChange: (value: string) => void;
  onNext: () => void;
  isValid: boolean;
  error: string;
  privacyReassurance: string;
  isSubmitting: boolean;
}

export default function IntroWhatsAppScreen({
  whatsappNumber,
  onWhatsAppChange,
  onNext,
  isValid,
  error,
  privacyReassurance,
  isSubmitting,
}: IntroWhatsAppScreenProps) {
  const [touched, setTouched] = useState(false);
  const [inputError, setInputError] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onWhatsAppChange(value);
    if (inputError) setInputError("");
    if (touched) setTouched(false);
  };

  const handleBlur = () => {
    setTouched(true);
    if (!whatsappNumber.trim()) {
      setInputError("Please enter your WhatsApp number to continue.");
    } else if (!isValid) {
      setInputError(
        "That doesn't look like a valid number. Please include your country code (e.g. +1 234 567 8900)."
      );
    } else {
      setInputError("");
    }
  };

  const displayError = inputError || error;
  const isTouchedAndInvalid = touched && !isValid;

  return (
    <div className="flex-1 flex flex-col justify-center px-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Find the right LED screen for your space
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          Answer 3 quick questions and get a recommendation on WhatsApp. No tech
          knowledge needed.
        </p>
      </header>

      <div className="w-full max-w-md mx-auto">
        <label
          htmlFor="whatsapp-number"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Where should we send your recommendation?
        </label>
        <p className="text-sm text-gray-500 mb-4">
          We&apos;ll text you the results on WhatsApp right here.
        </p>

        <div className="relative">
          <input
            id="whatsapp-number"
            type="tel"
            autoComplete="tel"
            value={whatsappNumber}
            onChange={handleInput}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === "Enter" && isValid && !isSubmitting && onNext()}
            placeholder="Enter your WhatsApp number"
            disabled={isSubmitting}
            className={`w-full px-4 py-4 text-base border-2 rounded-xl
              ${displayError ? "border-red-400" : "border-gray-300"}
              focus:outline-none focus:ring-2 focus:ring-offset-2
              focus:ring-green-200
              transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? "whatsapp-error" : "whatsapp-hint"}
          />
          <span
            id="whatsapp-hint"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          >
            e.g. +1 234 567 8900
          </span>
        </div>

        {displayError && (
          <p
            id="whatsapp-error"
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {displayError}
          </p>
        )}

        <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3 3a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06l-3-3z"
              clipRule="evenodd"
            />
          </svg>
          {privacyReassurance}
        </p>

        <button
          onClick={onNext}
          disabled={!isValid || isSubmitting}
          className="mt-6 w-full py-4 px-6 text-base font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
          style={{ backgroundColor: clientConfig.brandPrimaryColor }}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finding the right screen for you...
            </>
          ) : (
            "Get My Recommendation"
          )}
        </button>
      </div>
    </div>
  );
}
