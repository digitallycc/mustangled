import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestPost } from "../functions/api/send-recommendation";

const env = {
  EVOLUTION_BASE_URL: "https://evolution.example.com",
  EVOLUTION_API_KEY: "test-key",
  EVOLUTION_INSTANCE: "test-instance",
  ODOO_BASE_URL: "https://odoo.example.com",
  ODOO_API_TOKEN: "odoo-test-token",
};

const submission = {
  externalId: "550e8400-e29b-41d4-a716-446655440000",
  receivedAt: "2026-06-20T12:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("send-recommendation Function", () => {
  it("sends the text before the PDF and returns the recommendation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ exists: true, name: "Ayesha Khan" }]))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "text-message" } }))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "document-message" } }))
      .mockResolvedValueOnce(jsonResponse({ id: 42, created: false }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await onRequestPost({
      env,
      request: new Request("https://mustangled.com/api/send-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "+92 312 3456789",
          useCase: "shop_retail",
          environment: "indoor",
          sizeCategory: "medium",
          ...submission,
        }),
      }),
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(String(fetchMock.mock.calls[1][0])).toContain("/message/sendText/");
    expect(String(fetchMock.mock.calls[2][0])).toContain("/message/sendMedia/");
    expect(String(fetchMock.mock.calls[3][0])).toBe(
      "https://odoo.example.com/mustang_presales/api/v1/leads"
    );

    const documentBody = JSON.parse(
      String((fetchMock.mock.calls[2][1] as RequestInit).body)
    );
    expect(documentBody.media).toBe("https://mustangled.com/mustangled.pdf");
    expect(documentBody.mediatype).toBe("document");
    expect(documentBody.caption.toLowerCase()).toContain("whitepaper");
    expect(documentBody.caption.toLowerCase()).not.toContain("catalog");

    const odooRequest = fetchMock.mock.calls[3][1] as RequestInit;
    expect((odooRequest.headers as Record<string, string>).Authorization).toBe(
      "Bearer odoo-test-token"
    );
    const finalLead = JSON.parse(String(odooRequest.body));
    expect(finalLead).toMatchObject({
      external_id: submission.externalId,
      customer_name: "Ayesha Khan",
      whatsapp_number: "+923123456789",
      use_case: "Shop / Retail",
      recommendation_sent: true,
      whitepaper_sent: true,
      delivery_error: "",
    });
  });

  it("returns success when the text sends but the PDF fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ exists: true }]))
      .mockResolvedValueOnce(jsonResponse({ isBusiness: false }))
      .mockResolvedValueOnce(jsonResponse({ name: null }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(null))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "text-message" } }))
      .mockResolvedValueOnce(new Response("media failure", { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ id: 42 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await onRequestPost({
      env,
      request: new Request("https://mustangled.com/api/send-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "+92 312 3456789",
          useCase: "shop_retail",
          environment: "indoor",
          sizeCategory: "medium",
          ...submission,
        }),
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true });
  });

  it("supports a normalized international number returned by validation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ exists: true }]))
      .mockResolvedValueOnce(jsonResponse({ isBusiness: false }))
      .mockResolvedValueOnce(jsonResponse({ name: null }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(null))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "text-message" } }))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "document-message" } }))
      .mockResolvedValueOnce(jsonResponse({ id: 42 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await onRequestPost({
      env,
      request: new Request("https://mustangled.com/api/send-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "+44 7911 123456",
          useCase: "office_meeting",
          environment: "indoor",
          sizeCategory: "small",
          ...submission,
        }),
      }),
    });

    expect(response.status).toBe(200);
    const validationBody = JSON.parse(
      String((fetchMock.mock.calls[0][1] as RequestInit).body)
    );
    expect(validationBody.numbers).toEqual(["447911123456"]);
  });

  it("does not block WhatsApp delivery when Odoo is unavailable", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ exists: true }]))
      .mockResolvedValueOnce(jsonResponse({ isBusiness: false }))
      .mockResolvedValueOnce(jsonResponse({ name: null }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(null))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "text-message" } }))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "document-message" } }))
      .mockResolvedValueOnce(new Response("odoo unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await onRequestPost({
      env,
      request: new Request("https://mustangled.com/api/send-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "+92 312 3456789",
          useCase: "shop_retail",
          environment: "indoor",
          sizeCategory: "medium",
          ...submission,
        }),
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      leadCaptured: false,
    });
  });

  it("rejects a missing idempotency UUID before making external calls", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await onRequestPost({
      env,
      request: new Request("https://mustangled.com/api/send-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "+92 312 3456789",
          useCase: "shop_retail",
          environment: "indoor",
          sizeCategory: "medium",
          receivedAt: submission.receivedAt,
        }),
      }),
    });

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
