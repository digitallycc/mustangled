import { describe, expect, it } from "vitest";
import { RequestError } from "../functions/_shared/http";
import {
  maskPhoneNumber,
  normalizePhoneNumber,
} from "../functions/_shared/phone";

describe("normalizePhoneNumber", () => {
  it("normalizes Pakistani local mobile numbers", () => {
    expect(normalizePhoneNumber("0312 345 6789")).toBe("923123456789");
  });

  it("accepts E.164 international numbers", () => {
    expect(normalizePhoneNumber("+44 7911 123456")).toBe("447911123456");
    expect(normalizePhoneNumber("+1 (415) 555-2671")).toBe("14155552671");
  });

  it("accepts the international 00 prefix", () => {
    expect(normalizePhoneNumber("0044 7911 123456")).toBe("447911123456");
    expect(normalizePhoneNumber("00923315550505")).toBe("923315550505");
  });

  it("accepts digit-only international numbers because the UI owns the plus prefix", () => {
    expect(normalizePhoneNumber("447911123456")).toBe("447911123456");
  });

  it("uses a neutral validity error for invalid leading-zero numbers", () => {
    expect.assertions(2);
    try {
      normalizePhoneNumber("085355550505");
    } catch (error) {
      expect(error).toBeInstanceOf(RequestError);
      expect((error as RequestError).message).toBe(
        "That number is not valid. Check the digits and country code."
      );
    }
  });

  it("masks all but the final four digits", () => {
    expect(maskPhoneNumber("923123456789")).toBe("********6789");
  });
});
