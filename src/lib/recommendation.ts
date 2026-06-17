import type {
  PresalesInput,
  Recommendation,
  RecommendationType,
} from "./types";

export function getRecommendationType(
  input: PresalesInput
): RecommendationType {
  if (input.useCase === "restaurant_menu") {
    return "digital_menu_board";
  }

  if (input.useCase === "office_meeting") {
    return "office_video_wall";
  }

  if (input.useCase === "event_stage") {
    return "event_led_screen";
  }

  if (input.useCase === "outdoor_advertising") {
    if (
      input.sizeCategory === "very_large_billboard" ||
      input.environment === "outdoor"
    ) {
      return "outdoor_billboard";
    }
    return "outdoor_smd";
  }

  if (input.environment === "outdoor") {
    return "outdoor_smd";
  }

  if (input.environment === "semi_outdoor_shopfront") {
    return "transparent_shopfront_led";
  }

  if (input.useCase === "shop_retail") {
    return "indoor_smd";
  }

  return "needs_human_guidance";
}

const ctaLabels: Record<RecommendationType, string> = {
  indoor_smd: "Get My Quote on WhatsApp",
  outdoor_smd: "Get My Quote on WhatsApp",
  digital_menu_board: "Get My Menu Board Quote",
  office_video_wall: "Get My Video Wall Quote",
  event_led_screen: "Get My Event Screen Quote",
  outdoor_billboard: "Get My Billboard Quote",
  transparent_shopfront_led: "Get My Shopfront Quote",
  needs_human_guidance: "Talk to Us on WhatsApp",
};

export function getCTALabel(type: RecommendationType): string {
  return ctaLabels[type];
}

export function getRecommendationDetails(
  type: RecommendationType
): Omit<Recommendation, "leadScore" | "leadTemperature"> {
  const details: Record<
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
      whatsappMessage:
        "Hi, I just got an indoor SMD screen recommendation. Can you help me with a quote and installation details?",
    },
    outdoor_smd: {
      type: "outdoor_smd",
      title: "We recommend an outdoor SMD screen",
      explanation:
        "High-brightness display built to withstand sun, rain, and dust. Perfect for storefronts, outdoor signage, and public spaces.",
      suggestedNextStep:
        "Our team will help finalize brightness, size, and mounting options for your site.",
      whatsappMessage:
        "Hi, I just got an outdoor SMD screen recommendation. I'd like to discuss pricing and installation.",
    },
    digital_menu_board: {
      type: "digital_menu_board",
      title: "We recommend a digital menu board",
      explanation:
        "Designed for food service — easy to update, bright enough to read from across the room, and built for long operating hours.",
      suggestedNextStep:
        "Our team can help with sizing, mounting, and content setup.",
      whatsappMessage:
        "Hi, I just got a digital menu board recommendation. Can you share options and pricing?",
    },
    office_video_wall: {
      type: "office_video_wall",
      title: "We recommend an LED video wall for your office",
      explanation:
        "Ultra-slim, near-seamless display perfect for meeting rooms, boardrooms, and lobby walls.",
      suggestedNextStep:
        "Our team will help match the screen size and resolution to your room dimensions.",
      whatsappMessage:
        "Hi, I just got an LED video wall recommendation for our office. Can you help with specs and pricing?",
    },
    event_led_screen: {
      type: "event_led_screen",
      title: "We recommend an event LED screen",
      explanation:
        "Lightweight, modular, and transportable. Built for stages, concerts, conferences, and rental use.",
      suggestedNextStep:
        "Our team can help with panel count, setup, and on-site support.",
      whatsappMessage:
        "Hi, I just got an event LED screen recommendation. I need pricing and rental options.",
    },
    outdoor_billboard: {
      type: "outdoor_billboard",
      title: "We recommend an outdoor digital billboard",
      explanation:
        "Large-format, ultra-bright display built for high-traffic areas. Visible day and night in direct sunlight.",
      suggestedNextStep:
        "Our team will help with structural mounting, brightness specs, and permits.",
      whatsappMessage:
        "Hi, I just got an outdoor billboard recommendation. Can you share specs and installation details?",
    },
    transparent_shopfront_led: {
      type: "transparent_shopfront_led",
      title: "We recommend a transparent LED screen",
      explanation:
        "See-through display that keeps your window visibility while grabbing attention. Great for shopfronts and glass facades.",
      suggestedNextStep:
        "Our team will help match transparency level and brightness to your storefront.",
      whatsappMessage:
        "Hi, I just got a transparent LED screen recommendation for our shopfront. Can you help with options and pricing?",
    },
    needs_human_guidance: {
      type: "needs_human_guidance",
      title: "Let's figure this out together",
      explanation:
        "No problem. Tell us a bit more about your space and what you're trying to achieve, and we'll recommend the right solution.",
      suggestedNextStep:
        "Our team will personally review your needs and get back to you on WhatsApp.",
      whatsappMessage:
        "Hi, I'm looking for an LED display solution but I'm not sure what I need. Can you help?",
    },
  };

  return details[type];
}