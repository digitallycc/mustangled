import type {
  PresalesAnswers,
  Recommendation,
  SendRecommendationRequest,
} from "@/lib/types";

interface ApiErrorResponse {
  success: false;
  code?: string;
  message?: string;
}

interface ValidateNumberResponse {
  success: true;
  normalizedNumber: string;
  maskedNumber: string;
}

interface SendRecommendationResponse {
  success: true;
  recommendation: Recommendation;
}

async function postJson<T extends { success: true }>(
  path: string,
  body: unknown
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("We could not reach the service. Please check your connection and try again.");
  }

  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiErrorResponse
    | null;

  if (
    !response.ok ||
    !payload ||
    typeof payload !== "object" ||
    !("success" in payload) ||
    !payload.success
  ) {
    const errorPayload = payload as ApiErrorResponse | null;
    throw new Error(errorPayload?.message || "We could not complete that request. Please try again.");
  }

  return payload as T;
}

export function validateWhatsAppNumber(phoneNumber: string) {
  return postJson<ValidateNumberResponse>("/api/validate-number", { phoneNumber });
}

export function sendRecommendation(
  phoneNumber: string,
  answers: PresalesAnswers
) {
  const request: SendRecommendationRequest = { phoneNumber, ...answers };
  return postJson<SendRecommendationResponse>("/api/send-recommendation", request);
}
