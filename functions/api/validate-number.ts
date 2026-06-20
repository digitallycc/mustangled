import { errorResponse, jsonResponse, readJsonBody, RequestError } from "../_shared/http";
import { getWhatsAppContact } from "../_shared/evolution";
import { maskPhoneNumber, normalizePhoneNumber } from "../_shared/phone";
import type { EvolutionEnv, PagesFunction } from "../_shared/types";

export const onRequestPost: PagesFunction<EvolutionEnv> = async ({ request, env }) => {
  try {
    const body = await readJsonBody(request);
    const input = body as { phoneNumber?: unknown };
    const normalizedNumber = normalizePhoneNumber(input.phoneNumber);

    const contact = await getWhatsAppContact(env, normalizedNumber);
    if (!contact) {
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
      contactName: contact.name || "",
    });
  } catch (error) {
    return errorResponse(error);
  }
};
