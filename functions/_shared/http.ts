const MAX_JSON_BODY_LENGTH = 8_192;

export class RequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new RequestError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected a JSON request.");
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_JSON_BODY_LENGTH) {
    throw new RequestError(413, "REQUEST_TOO_LARGE", "The request is too large.");
  }

  const text = await request.text();
  if (!text || text.length > MAX_JSON_BODY_LENGTH) {
    throw new RequestError(400, "INVALID_REQUEST", "The request body is invalid.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new RequestError(400, "INVALID_JSON", "The request body is not valid JSON.");
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof RequestError) {
    return jsonResponse(
      { success: false, code: error.code, message: error.message },
      error.status
    );
  }

  console.error("Pages Function request failed", error);
  return jsonResponse(
    {
      success: false,
      code: "SERVICE_UNAVAILABLE",
      message: "We could not complete that request. Please try again.",
    },
    502
  );
}
