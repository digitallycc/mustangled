"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import IntroWhatsAppScreen from "@/components/screens/IntroWhatsAppScreen";
import UseCaseScreen from "@/components/screens/UseCaseScreen";
import EnvironmentScreen from "@/components/screens/EnvironmentScreen";
import SizeScreen from "@/components/screens/SizeScreen";
import RecommendationScreen from "@/components/screens/RecommendationScreen";
import { clientConfig } from "@/config/client";
import { getRecommendationType, getRecommendationDetails } from "@/lib/recommendation";
import { calculateLeadScore, getLeadTemperature } from "@/lib/lead-score";
import { buildWhatsAppUrl, buildPrefilledMessage, getUseCaseLabel, getEnvironmentLabel, getSizeCategoryLabel, submitLead } from "@/lib/whatsapp";
import {
  trackFlowStarted,
  trackWhatsAppEntered,
  trackUseCaseAnswered,
  trackEnvironmentAnswered,
  trackSizeAnswered,
  trackRecommendationViewed,
  trackWhatsAppHandoffClicked,
  trackFlowAbandoned,
} from "@/lib/analytics";
import type { Step, UseCase, Environment, SizeCategory, PresalesInput, Recommendation } from "@/lib/types";

const STEPS: Step[] = ["whatsapp", "use_case", "environment", "size", "recommendation"];

function validateWhatsAppNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return false;
  const patterns = [/^0[3]\d{9}$/, /^92[3]\d{9}$/, /^\+92[3]\d{9}$/, /^\d{10,15}$/];
  return patterns.some((p) => p.test(value)) || digits.length >= 11;
}

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
  const [currentStep, setCurrentStep] = useState<number>(() => loadState("step", 0));
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => loadState("whatsappNumber", ""));
  const [useCase, setUseCase] = useState<UseCase | null>(() => loadState("useCase", null));
  const [environment, setEnvironment] = useState<Environment | null>(() => loadState("environment", null));
  const [sizeCategory, setSizeCategory] = useState<SizeCategory | null>(() => loadState("sizeCategory", null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genericError, setGenericError] = useState("");

  const hasTrackedAbandon = useRef(false);

  useEffect(() => { saveState("step", currentStep); }, [currentStep]);
  useEffect(() => { saveState("whatsappNumber", whatsappNumber); }, [whatsappNumber]);
  useEffect(() => { saveState("useCase", useCase); }, [useCase]);
  useEffect(() => { saveState("environment", environment); }, [environment]);
  useEffect(() => { saveState("sizeCategory", sizeCategory); }, [sizeCategory]);

  useEffect(() => {
    trackFlowStarted();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!hasTrackedAbandon.current && currentStep < STEPS.length - 1) {
        trackFlowAbandoned(STEPS[currentStep]);
        hasTrackedAbandon.current = true;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentStep]);

  const input: PresalesInput | null = useMemo(() => {
    if (!useCase || !environment || !sizeCategory) return null;
    return { whatsappNumber, useCase, environment, sizeCategory };
  }, [whatsappNumber, useCase, environment, sizeCategory]);

  const recommendation: Recommendation | null = useMemo(() => {
    if (!input) return null;
    const type = getRecommendationType(input);
    const details = getRecommendationDetails(type);
    const score = calculateLeadScore(input);
    const temperature = getLeadTemperature(score);
    return {
      type: details.type,
      title: details.title,
      explanation: details.explanation,
      suggestedNextStep: details.suggestedNextStep,
      whatsappMessage: details.whatsappMessage,
      leadScore: score,
      leadTemperature: temperature,
    };
  }, [input]);

  const isWhatsAppValid = useMemo(
    () => validateWhatsAppNumber(whatsappNumber),
    [whatsappNumber]
  );

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      if (STEPS[currentStep] === "whatsapp") trackWhatsAppEntered(whatsappNumber);
      if (STEPS[currentStep] === "use_case" && useCase) trackUseCaseAnswered(useCase);
      if (STEPS[currentStep] === "environment" && environment) trackEnvironmentAnswered(environment);
      if (STEPS[currentStep] === "size" && sizeCategory) trackSizeAnswered(sizeCategory);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, whatsappNumber, useCase, environment, sizeCategory]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleWhatsAppHandoff = useCallback(async () => {
    if (!input || !recommendation) return;
    setIsSubmitting(true);
    setGenericError("");

    trackWhatsAppHandoffClicked(input, recommendation.type, recommendation.leadScore);

    await submitLead({
      clientSlug: clientConfig.slug,
      whatsappNumber: input.whatsappNumber,
      useCase: input.useCase,
      environment: input.environment,
      sizeCategory: input.sizeCategory,
      recommendationType: recommendation.type,
      recommendationTitle: recommendation.title,
      leadScore: recommendation.leadScore,
      leadTemperature: recommendation.leadTemperature,
      sourceUrl: typeof window !== "undefined" ? window.location.href : "",
      createdAt: new Date().toISOString(),
    });

    const message = buildPrefilledMessage({
      useCaseLabel: getUseCaseLabel(input.useCase),
      environmentLabel: getEnvironmentLabel(input.environment),
      sizeCategoryLabel: getSizeCategoryLabel(input.sizeCategory),
      recommendationTitle: recommendation.title,
      whatsappNumber: input.whatsappNumber,
    });
    const url = buildWhatsAppUrl(message);

    setIsSubmitting(false);
    window.open(url, "_blank");
  }, [input, recommendation]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setWhatsappNumber("");
    setUseCase(null);
    setEnvironment(null);
    setSizeCategory(null);
    setGenericError("");
    setIsSubmitting(false);
    localStorage.clear();
  }, []);

  const showProgress = currentStep >= 0 && currentStep < STEPS.length - 1;

  const renderScreen = () => {
    const screenKey = currentStep;

    if (currentStep === 0) {
      return (
        <div key={screenKey} className="animate-slide-in flex-1 flex flex-col">
          <IntroWhatsAppScreen
            whatsappNumber={whatsappNumber}
            onWhatsAppChange={setWhatsappNumber}
            onNext={handleNext}
            isValid={isWhatsAppValid}
            error={genericError}
            privacyReassurance="Your number is only used to send your recommendation. No spam."
            isSubmitting={isSubmitting}
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
            onNext={handleNext}
            onBack={handleBack}
            reassurance="Don't worry — just pick the closest option. We'll figure out the rest together."
          />
        </div>
      );
    }

    if (currentStep === 4 && recommendation && input) {
      return (
        <div key={screenKey} className="animate-fade-in flex-1 flex flex-col">
          <RecommendationScreen
            input={input}
            recommendation={recommendation}
            onWhatsAppHandoff={handleWhatsAppHandoff}
            onRestart={handleRestart}
            isSubmitting={isSubmitting}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-dvh flex flex-col bg-white">
      <header
        className="flex items-center justify-between px-6 py-4 max-w-xl mx-auto w-full"
        style={{ minHeight: "56px" }}
      >
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill={clientConfig.brandPrimaryColor}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="font-semibold text-sm text-gray-900">
            {clientConfig.companyName}
          </span>
        </div>
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
