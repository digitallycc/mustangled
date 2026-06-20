import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestPost } from "../functions/api/send-recommendation";

const env = {
  EVOLUTION_BASE_URL: "https://evolution.example.com",
  EVOLUTION_API_KEY: "test-key",
  EVOLUTION_INSTANCE: "test-instance",
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
      .mockResolvedValueOnce(jsonResponse([{ exists: true }]))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "text-message" } }))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "document-message" } }));
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
        }),
      }),
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1][0])).toContain("/message/sendText/");
    expect(String(fetchMock.mock.calls[2][0])).toContain("/message/sendMedia/");

    const documentBody = JSON.parse(
      String((fetchMock.mock.calls[2][1] as RequestInit).body)
    );
    expect(documentBody.media).toBe("https://mustangled.com/mustangled.pdf");
    expect(documentBody.mediatype).toBe("document");
    expect(documentBody.caption.toLowerCase()).toContain("whitepaper");
    expect(documentBody.caption.toLowerCase()).not.toContain("catalog");
  });

  it("returns success when the text sends but the PDF fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ exists: true }]))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "text-message" } }))
      .mockResolvedValueOnce(new Response("media failure", { status: 500 }));
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
      .mockResolvedValueOnce(jsonResponse({ key: { id: "text-message" } }))
      .mockResolvedValueOnce(jsonResponse({ key: { id: "document-message" } }));
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
        }),
      }),
    });

    expect(response.status).toBe(200);
    const validationBody = JSON.parse(
      String((fetchMock.mock.calls[0][1] as RequestInit).body)
    );
    expect(validationBody.numbers).toEqual(["447911123456"]);
  });
});
