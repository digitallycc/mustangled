import type {
  LeadTemperature,
  PresalesAnswers,
  Recommendation,
  RecommendationType,
} from "../../shared/presales";

const DETAILS: Record<
  RecommendationType,
  Omit<Recommendation, "leadScore" | "leadTemperature">
> = {
  indoor_smd: {
    type: "indoor_smd",
    title: "We recommend an indoor SMD screen",
    explanation:
      "Crisp, bright, and built for indoor environments. Ideal for retail spaces, lobbies, and meeting rooms where your audience is up close.",
    suggestedNextStep:
      "Our team will confirm the right pixel pitch and sizing for your space.",
  },
  outdoor_smd: {
    type: "outdoor_smd",
    title: "We recommend an outdoor SMD screen",
    explanation:
      "High-brightness display built to withstand sun, rain, and dust. Perfect for storefronts, outdoor signage, and public spaces.",
    suggestedNextStep:
      "Our team will help finalize brightness, size, and mounting options for your site.",
  },
  digital_menu_board: {
    type: "digital_menu_board",
    title: "We recommend a digital menu board",
    explanation:
      "Designed for food service - easy to update, bright enough to read from across the room, and built for long operating hours.",
    suggestedNextStep:
      "Our team can help with sizing, mounting, and content setup.",
  },
  office_video_wall: {
    type: "office_video_wall",
    title: "We recommend an LED video wall for your office",
    explanation:
      "Ultra-slim, near-seamless display perfect for meeting rooms, boardrooms, and lobby walls.",
    suggestedNextStep:
      "Our team will help match the screen size and resolution to your room dimensions.",
  },
  event_led_screen: {
    type: "event_led_screen",
    title: "We recommend an event LED screen",
    explanation:
      "Lightweight, modular, and transportable. Built for stages, concerts, conferences, and rental use.",
    suggestedNextStep:
      "Our team can help with panel count, setup, and on-site support.",
  },
  outdoor_billboard: {
    type: "outdoor_billboard",
    title: "We recommend an outdoor digital billboard",
    explanation:
      "Large-format, ultra-bright display built for high-traffic areas. Visible day and night in direct sunlight.",
    suggestedNextStep:
      "Our team will help with structural mounting, brightness specs, and permits.",
  },
  transparent_shopfront_led: {
    type: "transparent_shopfront_led",
    title: "We recommend a transparent LED screen",
    explanation:
      "See-through display that keeps your window visibility while grabbing attention. Great for shopfronts and glass facades.",
    suggestedNextStep:
      "Our team will help match transparency level and brightness to your storefront.",
  },
  needs_human_guidance: {
    type: "needs_human_guidance",
    title: "Let's figure this out together",
    explanation:
      "No problem. Tell us a bit more about your space and what you're trying to achieve, and we'll recommend the right solution.",
    suggestedNextStep:
      "Our team will personally review your needs and get back to you on WhatsApp.",
  },
};

function getRecommendationType(input: PresalesAnswers): RecommendationType {
  if (input.useCase === "restaurant_menu") return "digital_menu_board";
  if (input.useCase === "office_meeting") return "office_video_wall";
  if (input.useCase === "event_stage") return "event_led_screen";

  if (input.useCase === "outdoor_advertising") {
    if (
      input.sizeCategory === "very_large_billboard" ||
      input.environment === "outdoor"
    ) {
      return "outdoor_billboard";
    }
    return "outdoor_smd";
  }

  if (input.environment === "outdoor") return "outdoor_smd";
  if (input.environment === "semi_outdoor_shopfront") {
    return "transparent_shopfront_led";
  }
  if (input.useCase === "shop_retail") return "indoor_smd";
  return "needs_human_guidance";
}

function calculateLeadScore(input: PresalesAnswers): number {
  let score = 60;
  if (input.environment === "outdoor") score += 15;
  if (input.environment === "semi_outdoor_shopfront") score += 10;
  if (input.sizeCategory === "large") score += 15;
  if (input.sizeCategory === "very_large_billboard") score += 25;
  if (input.useCase === "outdoor_advertising") score += 15;
  if (input.useCase === "office_meeting") score += 10;
  if (input.useCase === "not_sure") score -= 5;
  if (input.sizeCategory === "not_sure") score -= 5;
  return Math.max(0, Math.min(100, score));
}

function getLeadTemperature(score: number): LeadTemperature {
  if (score >= 80) return "hot";
  if (score >= 55) return "warm";
  return "nurture";
}

export function getRecommendation(input: PresalesAnswers): Recommendation {
  const type = getRecommendationType(input);
  const score = calculateLeadScore(input);
  return {
    ...DETAILS[type],
    leadScore: score,
    leadTemperature: getLeadTemperature(score),
  };
}

const USE_CASE_LABELS: Record<PresalesAnswers["useCase"], string> = {
  shop_retail: "Shop / Retail",
  restaurant_menu: "Restaurant Menu",
  outdoor_advertising: "Outdoor Advertising",
  office_meeting: "Office / Meeting Room",
  event_stage: "Event / Stage",
  not_sure: "Not Sure",
};

const ENVIRONMENT_LABELS: Record<PresalesAnswers["environment"], string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  semi_outdoor_shopfront: "Shopfront / Semi-outdoor",
  not_sure: "Not Sure",
};

const SIZE_LABELS: Record<PresalesAnswers["sizeCategory"], string> = {
  small: "Small: up to 6 ft",
  medium: "Medium: 6-12 ft",
  large: "Large: 12-25 ft",
  very_large_billboard: "Very Large / Billboard",
  not_sure: "Not Sure",
};

export function buildRecommendationMessage(
  input: PresalesAnswers,
  recommendation: Recommendation
): string {
  return `Hello from Mustang LED.

Thank you for sharing your screen requirements. Based on your answers:

- Use case: ${USE_CASE_LABELS[input.useCase]}
- Installation: ${ENVIRONMENT_LABELS[input.environment]}
- Approximate size: ${SIZE_LABELS[input.sizeCategory]}

${recommendation.title}

${recommendation.explanation}

Next step: ${recommendation.suggestedNextStep}

A Mustang LED consultant will contact you to discuss your project and provide a definitive quotation.`;
}

export const WHITEPAPER_CAPTION =
  "Please find our whitepaper attached. A Mustang LED consultant will contact you to discuss your specific requirements and provide a definitive quotation tailored to your project.";
