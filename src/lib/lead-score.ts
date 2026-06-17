import type { PresalesInput } from "./types";

export function calculateLeadScore(input: PresalesInput): number {
  let score = 40;

  if (input.whatsappNumber) score += 20;

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

export function getLeadTemperature(
  score: number
): "hot" | "warm" | "nurture" {
  if (score >= 80) return "hot";
  if (score >= 55) return "warm";
  return "nurture";
}