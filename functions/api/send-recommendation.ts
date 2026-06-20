import { isPresalesAnswers } from "../../shared/presales";
import { errorResponse, jsonResponse, readJsonBody, RequestError } from "../_shared/http";
import {
  isWhatsAppNumber,
  sendTextMessage,
  sendWhitepaper,
} from "../_shared/evolution";
import { normalizePhoneNumber } from "../_shared/phone";
import {
  buildRecommendationMessage,
  getRecommendation,
  WHITEPAPER_CAPTION,
} from "../_shared/recommendation";
import type { EvolutionEnv, PagesFunction } from "../_shared/types";

export const onRequestPost: PagesFunction<EvolutionEnv> = async ({ request, env }) => {
  try {
    const body = await readJsonBody(request);
    const input = body as { phoneNumber?: unknown } & Record<string, unknown>;
    const normalizedNumber = normalizePhoneNumber(input.phoneNumber);

    if (!isPresalesAnswers(input)) {
      throw new RequestError(
        400,
        "INVALID_ANSWERS",
        "One or more questionnaire answers are invalid."
      );
    }

    if (!(await isWhatsAppNumber(env, normalizedNumber))) {
      throw new RequestError(
        422,
        "NOT_ON_WHATSAPP",
        "We could not find a WhatsApp account for that number."
      );
    }

    const recommendation = getRecommendation(input);
    const message = buildRecommendationMessage(input, recommendation);
    await sendTextMessage(env, normalizedNumber, message);

    try {
      const whitepaperUrl = new URL("/mustangled.pdf", request.url).toString();
      await sendWhitepaper(
        env,
        normalizedNumber,
        whitepaperUrl,
        WHITEPAPER_CAPTION
      );
    } catch (error) {
      console.error("Whitepaper delivery failed after recommendation was sent", error);
    }

    return jsonResponse({ success: true, recommendation });
  } catch (error) {
    return errorResponse(error);
  }
};
