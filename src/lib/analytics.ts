import type { PresalesInput, RecommendationType } from "./types";

type AnalyticsEvent =
  | "hook_clicked"
  | "flow_started"
  | "whatsapp_entered"
  | "question_answered_use_case"
  | "question_answered_environment"
  | "question_answered_size"
  | "recommendation_viewed"
  | "whatsapp_handoff_clicked"
  | "flow_abandoned";

interface AnalyticsPayload {
  clientSlug: string;
  step: string;
  timestamp: string;
  useCase?: string;
  environment?: string;
  sizeCategory?: string;
  recommendationType?: string;
  leadScore?: number;
}

const clientSlug = "mustang-led";

function sendEvent(
  event: AnalyticsEvent,
  data: Partial<AnalyticsPayload> = {}
): void {
  const payload: AnalyticsPayload = {
    clientSlug,
    step: event,
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (typeof window !== "undefined") {
    try {
      console.log("[Analytics]", event, payload);
      if (window.gtag) {
        window.gtag("event", event, payload as unknown as Record<string, unknown>);
      }
    } catch {
    }
  }
}

export function trackHookClicked(): void {
  sendEvent("hook_clicked");
}

export function trackFlowStarted(): void {
  sendEvent("flow_started");
}

export function trackWhatsAppEntered(whatsappNumber: string): void {
  sendEvent("whatsapp_entered", { useCase: whatsappNumber });
}

export function trackUseCaseAnswered(useCase: string): void {
  sendEvent("question_answered_use_case", { useCase });
}

export function trackEnvironmentAnswered(environment: string): void {
  sendEvent("question_answered_environment", { environment });
}

export function trackSizeAnswered(sizeCategory: string): void {
  sendEvent("question_answered_size", { sizeCategory });
}

export function trackRecommendationViewed(
  input: PresalesInput,
  recommendationType: RecommendationType,
  leadScore: number
): void {
  sendEvent("recommendation_viewed", {
    useCase: input.useCase,
    environment: input.environment,
    sizeCategory: input.sizeCategory,
    recommendationType,
    leadScore,
  });
}

export function trackWhatsAppHandoffClicked(
  input: PresalesInput,
  recommendationType: RecommendationType,
  leadScore: number
): void {
  sendEvent("whatsapp_handoff_clicked", {
    useCase: input.useCase,
    environment: input.environment,
    sizeCategory: input.sizeCategory,
    recommendationType,
    leadScore,
  });
}

export function trackFlowAbandoned(step: string): void {
  sendEvent("flow_abandoned", { step });
}