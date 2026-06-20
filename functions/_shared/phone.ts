import { parsePhoneNumberFromString } from "libphonenumber-js";
import { RequestError } from "./http";

export function normalizePhoneNumber(input: unknown): string {
  if (typeof input !== "string" || !input.trim()) {
    throw new RequestError(400, "INVALID_NUMBER", "Please enter your WhatsApp number.");
  }

  let candidate = input.trim();
  if (candidate.startsWith("00")) candidate = `+${candidate.slice(2)}`;

  const digits = candidate.replace(/\D/g, "");
  if (/^03\d{9}$/.test(digits)) {
    candidate = `+92${digits.slice(1)}`;
  } else if (digits.startsWith("0")) {
    throw new RequestError(
      400,
      "INVALID_NUMBER",
      "That number is not valid. Check the digits and country code."
    );
  } else if (!candidate.startsWith("+")) {
    candidate = `+${digits}`;
  }

  const parsed = parsePhoneNumberFromString(candidate);
  if (!parsed?.isValid()) {
    throw new RequestError(
      400,
      "INVALID_NUMBER",
      "That number is not valid. Check the digits and country code."
    );
  }

  return parsed.number.slice(1);
}

export function maskPhoneNumber(number: string): string {
  const visibleDigits = number.slice(-4);
  return `${"*".repeat(Math.max(0, number.length - 4))}${visibleDigits}`;
}
