export type Step =
  | "intro"
  | "whatsapp"
  | "use_case"
  | "environment"
  | "size"
  | "recommendation";

export type UseCase =
  | "shop_retail"
  | "restaurant_menu"
  | "outdoor_advertising"
  | "office_meeting"
  | "event_stage"
  | "not_sure";

export type Environment =
  | "indoor"
  | "outdoor"
  | "semi_outdoor_shopfront"
  | "not_sure";

export type SizeCategory =
  | "small"
  | "medium"
  | "large"
  | "very_large_billboard"
  | "not_sure";

export type RecommendationType =
  | "indoor_smd"
  | "outdoor_smd"
  | "digital_menu_board"
  | "office_video_wall"
  | "event_led_screen"
  | "outdoor_billboard"
  | "transparent_shopfront_led"
  | "needs_human_guidance";

export interface PresalesInput {
  whatsappNumber: string;
  useCase: UseCase;
  environment: Environment;
  sizeCategory: SizeCategory;
}

export interface Recommendation {
  type: RecommendationType;
  title: string;
  explanation: string;
  suggestedNextStep: string;
  whatsappMessage: string;
  leadScore: number;
  leadTemperature: "hot" | "warm" | "nurture";
}

export interface LeadPayload {
  clientSlug: string;
  whatsappNumber: string;
  useCase: string;
  environment: string;
  sizeCategory: string;
  recommendationType: string;
  recommendationTitle: string;
  leadScore: number;
  leadTemperature: "hot" | "warm" | "nurture";
  sourceUrl: string;
  createdAt: string;
}