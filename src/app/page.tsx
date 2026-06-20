"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import IntroWhatsAppScreen from "@/components/screens/IntroWhatsAppScreen";
import UseCaseScreen from "@/components/screens/UseCaseScreen";
import EnvironmentScreen from "@/components/screens/EnvironmentScreen";
import SizeScreen from "@/components/screens/SizeScreen";
import RecommendationScreen from "@/components/screens/RecommendationScreen";
import { clientConfig } from "@/config/client";
import {
  sendRecommendation,
  validateWhatsAppNumber,
} from "@/lib/presales-api";
import type {
  Environment,
  PresalesAnswers,
  SizeCategory,
  Step,
  UseCase,
} from "@/lib/types";

const STEPS: Step[] = ["whatsapp", "use_case", "environment", "size", "delivery"];
const FUNNEL_STORAGE_KEYS = [
  "step",
  "whatsappNumber",
  "useCase",
  "environment",
  "sizeCategory",
];

function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveState(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = loadState("step", 0);
    return savedStep >= STEPS.length - 1 ? STEPS.length - 2 : savedStep;
  });
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => loadState("whatsappNumber", ""));
  const [useCase, setUseCase] = useState<UseCase | null>(() => loadState("useCase", null));
  const [environment, setEnvironment] = useState<Environment | null>(() => loadState("environment", null));
  const [sizeCategory, setSizeCategory] = useState<SizeCategory | null>(() => loadState("sizeCategory", null));
  const [isValidating, setIsValidating] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [maskedNumber, setMaskedNumber] = useState("");
  const [genericError, setGenericError] = useState("");

  useEffect(() => { saveState("step", currentStep); }, [currentStep]);
  useEffect(() => { saveState("whatsappNumber", whatsappNumber); }, [whatsappNumber]);
  useEffect(() => { saveState("useCase", useCase); }, [useCase]);
  useEffect(() => { saveState("environment", environment); }, [environment]);
  useEffect(() => { saveState("sizeCategory", sizeCategory); }, [sizeCategory]);

  const answers: PresalesAnswers | null = useMemo(() => {
    if (!useCase || !environment || !sizeCategory) return null;
    return { useCase, environment, sizeCategory };
  }, [useCase, environment, sizeCategory]);

  const handlePhoneChange = useCallback((value: string) => {
    setWhatsappNumber(value);
    setGenericError("");
  }, []);

  const handleValidateNumber = useCallback(async () => {
    if (!whatsappNumber.trim() || isValidating) return;

    setIsValidating(true);
    setGenericError("");
    try {
      const result = await validateWhatsAppNumber(whatsappNumber);
      setWhatsappNumber(result.normalizedNumber);
      setMaskedNumber(result.maskedNumber);
      setCurrentStep(1);
    } catch (error) {
      setGenericError(
        error instanceof Error ? error.message : "We could not validate that number."
      );
    } finally {
      setIsValidating(false);
    }
  }, [isValidating, whatsappNumber]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleSendRecommendation = useCallback(async () => {
    if (!answers || deliveryStatus === "sending") return;

    setCurrentStep(STEPS.length - 1);
    setDeliveryStatus("sending");
    setGenericError("");
    try {
      await sendRecommendation(whatsappNumber, answers);
      setDeliveryStatus("success");
      FUNNEL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      setDeliveryStatus("error");
      setGenericError(
        error instanceof Error
          ? error.message
          : "We could not send your recommendation. Please try again."
      );
    }
  }, [answers, deliveryStatus, whatsappNumber]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setWhatsappNumber("");
    setUseCase(null);
    setEnvironment(null);
    setSizeCategory(null);
    setGenericError("");
    setIsValidating(false);
    setDeliveryStatus("idle");
    setMaskedNumber("");
    FUNNEL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  const showProgress = currentStep >= 0 && currentStep < STEPS.length - 1;

  const renderScreen = () => {
    const screenKey = currentStep;

    if (currentStep === 0) {
      return (
        <div key={screenKey} className="animate-slide-in flex-1 flex flex-col">
          <IntroWhatsAppScreen
            whatsappNumber={whatsappNumber}
            onWhatsAppChange={handlePhoneChange}
            onNext={handleValidateNumber}
            canContinue={Boolean(whatsappNumber.trim())}
            error={genericError}
            privacyReassurance="Your number is only used to send your recommendation. No spam."
            isSubmitting={isValidating}
          />
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div key={screenKey} className="animate-slide-in flex-1 flex flex-col">
          <UseCaseScreen
            selectedUseCase={useCase}
            onUseCaseChange={setUseCase}
            onNext={handleNext}
            onBack={handleBack}
            reassurance="Don't worry — just pick the closest option. We'll figure out the rest together."
          />
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div key={screenKey} className="animate-slide-in flex-1 flex flex-col">
          <EnvironmentScreen
            selectedEnvironment={environment}
            onEnvironmentChange={setEnvironment}
            onNext={handleNext}
            onBack={handleBack}
            reassurance="Don't worry — just pick the closest option. We'll figure out the rest together."
          />
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div key={screenKey} className="animate-slide-in flex-1 flex flex-col">
          <SizeScreen
            selectedSize={sizeCategory}
            onSizeChange={setSizeCategory}
            onNext={handleSendRecommendation}
            onBack={handleBack}
            reassurance="Don't worry — just pick the closest option. We'll figure out the rest together."
          />
        </div>
      );
    }

    if (currentStep === 4) {
      return (
        <div key={screenKey} className="animate-fade-in flex-1 flex flex-col">
          <RecommendationScreen
            status={deliveryStatus}
            maskedNumber={maskedNumber}
            error={genericError}
            onRetry={handleSendRecommendation}
            onBack={() => setCurrentStep(3)}
            onRestart={handleRestart}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-dvh flex flex-col">
      <header
        className="flex items-center justify-between px-6 py-4 max-w-xl mx-auto w-full header-shadow"
        style={{ minHeight: "56px" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <span className="font-semibold text-base text-gray-900 tracking-tight">
            {clientConfig.companyName}
          </span>
        </div>
        <a href="https://aitechworx.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 no-underline">
          <span className="text-xs text-gray-400 font-medium">Powered by</span>
          <div className="h-5 rounded-md bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center px-1.5">
            <span className="text-[9px] font-bold text-white leading-none tracking-tight">AITW</span>
          </div>
        </a>
      </header>

      {showProgress && (
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={STEPS.length - 1}
        />
      )}

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {renderScreen()}
      </div>
    </main>
  );
}
