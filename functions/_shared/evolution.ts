import type { EvolutionEnv } from "./types";

interface WhatsAppNumberResult {
  exists?: boolean;
  jid?: string;
  number?: string;
}

function getEvolutionConfig(env: EvolutionEnv) {
  const baseUrl = env.EVOLUTION_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl || !env.EVOLUTION_API_KEY || !env.EVOLUTION_INSTANCE) {
    throw new Error("Evolution API configuration is incomplete.");
  }

  return {
    baseUrl,
    apiKey: env.EVOLUTION_API_KEY,
    instance: encodeURIComponent(env.EVOLUTION_INSTANCE),
  };
}

async function evolutionRequest(
  env: EvolutionEnv,
  path: string,
  body: unknown
): Promise<unknown> {
  const config = getEvolutionConfig(env);
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Evolution API request failed (${response.status}): ${responseText.slice(0, 200)}`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

export async function isWhatsAppNumber(
  env: EvolutionEnv,
  number: string
): Promise<boolean> {
  const config = getEvolutionConfig(env);
  const response = await evolutionRequest(
    env,
    `/chat/whatsappNumbers/${config.instance}`,
    { numbers: [number] }
  );

  const results = Array.isArray(response)
    ? response
    : ((response as { value?: unknown[] })?.value ?? []);
  return Boolean((results[0] as WhatsAppNumberResult | undefined)?.exists);
}

export async function sendTextMessage(
  env: EvolutionEnv,
  number: string,
  text: string
): Promise<void> {
  const config = getEvolutionConfig(env);
  await evolutionRequest(env, `/message/sendText/${config.instance}`, {
    number,
    text,
  });
}

export async function sendWhitepaper(
  env: EvolutionEnv,
  number: string,
  mediaUrl: string,
  caption: string
): Promise<void> {
  const config = getEvolutionConfig(env);
  await evolutionRequest(env, `/message/sendMedia/${config.instance}`, {
    number,
    mediatype: "document",
    mimetype: "application/pdf",
    caption,
    media: mediaUrl,
    fileName: "Mustang-LED-Whitepaper.pdf",
  });
}
