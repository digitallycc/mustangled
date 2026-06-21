import { afterEach, describe, expect, it, vi } from "vitest";
import { getWhatsAppContact } from "../functions/_shared/evolution";

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

describe("Evolution contact name resolution", () => {
  it("uses a direct validation name without extra lookups", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse([
        {
          exists: true,
          jid: "923123456789@s.whatsapp.net",
          name: "Ayesha Khan",
        },
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getWhatsAppContact(env, "923123456789")).resolves.toMatchObject({
      name: "Ayesha Khan",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("checks every supported lookup before using the best available name", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse([
          {
            exists: true,
            jid: "923123456789@s.whatsapp.net",
            name: "923123456789@s.whatsapp.net",
          },
        ])
      )
      .mockResolvedValueOnce(jsonResponse({ isBusiness: true }))
      .mockResolvedValueOnce(jsonResponse({ name: null }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(null))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            pushName: null,
            lastMessage: { pushName: "Ayesha Khan" },
          },
        ])
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getWhatsAppContact(env, "923123456789")).resolves.toMatchObject({
      name: "Ayesha Khan",
    });
    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "https://evolution.example.com/chat/whatsappNumbers/test-instance",
      "https://evolution.example.com/chat/fetchBusinessProfile/test-instance",
      "https://evolution.example.com/chat/fetchProfile/test-instance",
      "https://evolution.example.com/chat/findContacts/test-instance",
      "https://evolution.example.com/chat/findChatByRemoteJid/test-instance?remoteJid=923123456789%40s.whatsapp.net",
      "https://evolution.example.com/chat/findChats/test-instance",
    ]);
  });

  it("does not make optional name lookups during number-only validation", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse([{ exists: true, jid: "923123456789@s.whatsapp.net" }])
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getWhatsAppContact(env, "923123456789", { resolveName: false })
    ).resolves.toMatchObject({ exists: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
