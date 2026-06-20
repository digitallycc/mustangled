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
  });

  it("rejects international numbers without a plus or 00 prefix", () => {
    expect(() => normalizePhoneNumber("447911123456")).toThrow(RequestError);
  });

  it("masks all but the final four digits", () => {
    expect(maskPhoneNumber("923123456789")).toBe("********6789");
  });
});
