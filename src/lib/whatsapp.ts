import { clientConfig } from "@/config/client";

export function buildWhatsAppUrl(
  message: string,
  businessNumber?: string
): string {
  const number = businessNumber || clientConfig.businessWhatsappNumber;
  const cleanNumber = number.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildPrefilledMessage(
  input: {
    useCaseLabel: string;
    environmentLabel: string;
    sizeCategoryLabel: string;
    recommendationTitle: string;
    whatsappNumber: string;
  }
): string {
  return `Hello, I need guidance for an SMD / LED screen.

My requirement:
- Use case: ${input.useCaseLabel}
- Installation: ${input.environmentLabel}
- Size: ${input.sizeCategoryLabel}
- Suggested solution: ${input.recommendationTitle}
- My WhatsApp: ${input.whatsappNumber}

Please guide me with the best option and estimated price.`;
}

export function getUseCaseLabel(useCase: string): string {
  const labels: Record<string, string> = {
    shop_retail: "Shop / Retail",
    restaurant_menu: "Restaurant Menu",
    outdoor_advertising: "Outdoor Advertising",
    office_meeting: "Office / Meeting Room",
    event_stage: "Event / Stage",
    not_sure: "Not Sure",
  };
  return labels[useCase] || useCase;
}

export function getEnvironmentLabel(environment: string): string {
  const labels: Record<string, string> = {
    indoor: "Indoor",
    outdoor: "Outdoor",
    semi_outdoor_shopfront: "Shopfront / Semi-outdoor",
    not_sure: "Not Sure",
  };
  return labels[environment] || environment;
}

export function getSizeCategoryLabel(sizeCategory: string): string {
  const labels: Record<string, string> = {
    small: "Small: up to 6 ft",
    medium: "Medium: 6–12 ft",
    large: "Large: 12–25 ft",
    very_large_billboard: "Very Large / Billboard",
    not_sure: "Not Sure",
  };
  return labels[sizeCategory] || sizeCategory;
}

export function submitLead(
  payload: {
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
): Promise<{ success: boolean }> {
  return fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .catch(() => ({ success: false }));
}