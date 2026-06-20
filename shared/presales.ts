export const USE_CASES = [
  "shop_retail",
  "restaurant_menu",
  "outdoor_advertising",
  "office_meeting",
  "event_stage",
  "not_sure",
] as const;

export const ENVIRONMENTS = [
  "indoor",
  "outdoor",
  "semi_outdoor_shopfront",
  "not_sure",
] as const;

export const SIZE_CATEGORIES = [
  "small",
  "medium",
  "large",
  "very_large_billboard",
  "not_sure",
] as const;

export type UseCase = (typeof USE_CASES)[number];
export type Environment = (typeof ENVIRONMENTS)[number];
export type SizeCategory = (typeof SIZE_CATEGORIES)[number];

export type RecommendationType =
  | "indoor_smd"
  | "outdoor_smd"
  | "digital_menu_board"
  | "office_video_wall"
  | "event_led_screen"
  | "outdoor_billboard"
  | "transparent_shopfront_led"
  | "needs_human_guidance";

export type LeadTemperature = "hot" | "warm" | "nurture";

export interface PresalesAnswers {
  useCase: UseCase;
  environment: Environment;
  sizeCategory: SizeCategory;
}

export interface Recommendation {
  type: RecommendationType;
  title: string;
  explanation: string;
  suggestedNextStep: string;
  leadScore: number;
  leadTemperature: LeadTemperature;
}

export interface SendRecommendationRequest extends PresalesAnswers {
  phoneNumber: string;
}

export function isPresalesAnswers(value: unknown): value is PresalesAnswers {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;

  return (
    USE_CASES.includes(input.useCase as UseCase) &&
    ENVIRONMENTS.includes(input.environment as Environment) &&
    SIZE_CATEGORIES.includes(input.sizeCategory as SizeCategory)
  );
}
