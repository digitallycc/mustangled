import { describe, expect, it } from "vitest";
import {
  buildRecommendationMessage,
  getRecommendation,
  WHITEPAPER_CAPTION,
} from "../functions/_shared/recommendation";

describe("getRecommendation", () => {
  it("prioritizes restaurant menu boards", () => {
    const result = getRecommendation({
      useCase: "restaurant_menu",
      environment: "outdoor",
      sizeCategory: "large",
    });
    expect(result.type).toBe("digital_menu_board");
  });

  it("selects a billboard for very large outdoor advertising", () => {
    const result = getRecommendation({
      useCase: "outdoor_advertising",
      environment: "outdoor",
      sizeCategory: "very_large_billboard",
    });
    expect(result.type).toBe("outdoor_billboard");
    expect(result.leadScore).toBe(100);
  });

  it("falls back to human guidance for uncertain answers", () => {
    const result = getRecommendation({
      useCase: "not_sure",
      environment: "not_sure",
      sizeCategory: "not_sure",
    });
    expect(result.type).toBe("needs_human_guidance");
  });
});

describe("message copy", () => {
  it("builds a fixed recommendation message from answers", () => {
    const answers = {
      useCase: "shop_retail" as const,
      environment: "indoor" as const,
      sizeCategory: "medium" as const,
    };
    const message = buildRecommendationMessage(
      answers,
      getRecommendation(answers)
    );

    expect(message).toContain("Hello from Mustang LED");
    expect(message).toContain("Shop / Retail");
    expect(message).toContain("indoor SMD screen");
  });

  it("describes only a whitepaper in the document caption", () => {
    expect(WHITEPAPER_CAPTION.toLowerCase()).toContain("whitepaper");
    expect(WHITEPAPER_CAPTION.toLowerCase()).not.toContain("catalog");
  });
});
