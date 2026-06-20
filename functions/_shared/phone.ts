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
  } else if (/^923\d{9}$/.test(digits)) {
    candidate = `+${digits}`;
  } else if (!candidate.startsWith("+")) {
    throw new RequestError(
      400,
      "INVALID_NUMBER",
      "Please include the international country code, for example +44 or +92."
    );
  }

  const parsed = parsePhoneNumberFromString(candidate);
  if (!parsed?.isValid()) {
    throw new RequestError(
      400,
      "INVALID_NUMBER",
      "That does not look like a valid international phone number."
    );
  }

  return parsed.number.slice(1);
}

export function maskPhoneNumber(number: string): string {
  const visibleDigits = number.slice(-4);
  return `${"*".repeat(Math.max(0, number.length - 4))}${visibleDigits}`;
}
