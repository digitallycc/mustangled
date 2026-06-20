import { errorResponse, jsonResponse, readJsonBody, RequestError } from "../_shared/http";
import { isWhatsAppNumber } from "../_shared/evolution";
import { maskPhoneNumber, normalizePhoneNumber } from "../_shared/phone";
import type { EvolutionEnv, PagesFunction } from "../_shared/types";

export const onRequestPost: PagesFunction<EvolutionEnv> = async ({ request, env }) => {
  try {
    const body = await readJsonBody(request);
    const input = body as { phoneNumber?: unknown };
    const normalizedNumber = normalizePhoneNumber(input.phoneNumber);

    if (!(await isWhatsAppNumber(env, normalizedNumber))) {
      throw new RequestError(
        422,
        "NOT_ON_WHATSAPP",
        "We could not find a WhatsApp account for that number."
      );
    }

    return jsonResponse({
      success: true,
      normalizedNumber: `+${normalizedNumber}`,
      maskedNumber: maskPhoneNumber(normalizedNumber),
    });
  } catch (error) {
    return errorResponse(error);
  }
};
