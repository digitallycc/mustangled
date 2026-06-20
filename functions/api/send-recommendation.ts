import { isPresalesAnswers } from "../../shared/presales";
import { errorResponse, jsonResponse, readJsonBody, RequestError } from "../_shared/http";
import {
  getWhatsAppContact,
  sendTextMessage,
  sendWhitepaper,
} from "../_shared/evolution";
import { upsertOdooLead, type OdooLeadPayload } from "../_shared/odoo";
import { normalizePhoneNumber } from "../_shared/phone";
import {
  buildRecommendationMessage,
  getRecommendation,
  getRequirementLabels,
  WHITEPAPER_CAPTION,
} from "../_shared/recommendation";
import type { AppEnv, PagesFunction } from "../_shared/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSourceUrl(request: Request): string {
  const requestUrl = new URL(request.url);
  const referrer = request.headers.get("referer");
  if (!referrer) return new URL("/", requestUrl).toString();

  try {
    const referrerUrl = new URL(referrer);
    return referrerUrl.origin === requestUrl.origin
      ? `${referrerUrl.origin}${referrerUrl.pathname}`
      : new URL("/", requestUrl).toString();
  } catch {
    return new URL("/", requestUrl).toString();
  }
}

async function captureLead(
  env: AppEnv,
  payload: OdooLeadPayload
): Promise<boolean> {
  try {
    await upsertOdooLead(env, payload);
    return true;
  } catch (error) {
    console.error("Odoo lead capture failed", error);
    return false;
  }
}

export const onRequestPost: PagesFunction<AppEnv> = async ({ request, env }) => {
  try {
    const body = await readJsonBody(request);
    const input = body as {
      phoneNumber?: unknown;
      externalId?: unknown;
      receivedAt?: unknown;
    } & Record<string, unknown>;
    const normalizedNumber = normalizePhoneNumber(input.phoneNumber);

    if (!isPresalesAnswers(input)) {
      throw new RequestError(
        400,
        "INVALID_ANSWERS",
        "One or more questionnaire answers are invalid."
      );
    }

    if (typeof input.externalId !== "string" || !UUID_PATTERN.test(input.externalId)) {
      throw new RequestError(400, "INVALID_EXTERNAL_ID", "The submission ID is invalid.");
    }
    if (
      typeof input.receivedAt !== "string" ||
      !Number.isFinite(Date.parse(input.receivedAt))
    ) {
      throw new RequestError(400, "INVALID_RECEIVED_AT", "The submission time is invalid.");
    }

    const contact = await getWhatsAppContact(env, normalizedNumber);
    if (!contact) {
      throw new RequestError(
        422,
        "NOT_ON_WHATSAPP",
        "We could not find a WhatsApp account for that number."
      );
    }

    const recommendation = getRecommendation(input);
    const labels = getRequirementLabels(input);
    const message = buildRecommendationMessage(input, recommendation);
    const customerName = contact.name?.trim().slice(0, 255);
    const lead: OdooLeadPayload = {
      external_id: input.externalId,
      customer_name: customerName || `WhatsApp ${normalizedNumber.slice(-4)}`,
      whatsapp_number: `+${normalizedNumber}`,
      use_case: labels.useCase,
      environment: labels.environment,
      size_category: labels.sizeCategory,
      recommendation_type: recommendation.type,
      recommendation_title: recommendation.title,
      recommendation_explanation: recommendation.explanation,
      lead_temperature: recommendation.leadTemperature,
      received_at: input.receivedAt,
      source_url: getSourceUrl(request).slice(0, 2048),
      recommendation_sent: false,
      whitepaper_sent: false,
      delivery_error: "",
    };

    try {
      await sendTextMessage(env, normalizedNumber, message);
      lead.recommendation_sent = true;
    } catch (error) {
      lead.delivery_error = "The recommendation message could not be sent.";
      await captureLead(env, lead);
      throw error;
    }

    try {
      const whitepaperUrl = new URL("/mustangled.pdf", request.url).toString();
      await sendWhitepaper(
        env,
        normalizedNumber,
        whitepaperUrl,
        WHITEPAPER_CAPTION
      );
      lead.whitepaper_sent = true;
    } catch (error) {
      lead.delivery_error = "The recommendation was sent, but the whitepaper could not be delivered.";
      console.error("Whitepaper delivery failed after recommendation was sent", error);
    }

    const leadCaptured = await captureLead(env, lead);
    return jsonResponse({ success: true, recommendation, leadCaptured });
  } catch (error) {
    return errorResponse(error);
  }
};
