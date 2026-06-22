import type { EvolutionEnv } from "./types";

export interface WhatsAppContact {
  exists?: boolean;
  jid?: string;
  number?: string;
  name?: string;
  pushName?: string;
  verifiedName?: string;
  displayName?: string;
  businessName?: string;
  notify?: string;
}

interface ContactLookupOptions {
  resolveName?: boolean;
}

type UnknownRecord = Record<string, unknown>;

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
  body: unknown,
  method: "GET" | "POST" = "POST"
): Promise<unknown> {
  const config = getEvolutionConfig(env);
  const response = await fetch(`${config.baseUrl}${path}`, {
    method,
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
    },
    body: method === "POST" ? JSON.stringify(body) : undefined,
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

async function optionalEvolutionRequest(
  env: EvolutionEnv,
  path: string,
  body: unknown,
  method: "GET" | "POST" = "POST"
): Promise<unknown> {
  try {
    return await evolutionRequest(env, path, body, method);
  } catch (error) {
    console.warn(`Optional Evolution lookup failed for ${path}`, error);
    return null;
  }
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function firstRecord(value: unknown): UnknownRecord | null {
  if (Array.isArray(value)) return asRecord(value[0]);
  const record = asRecord(value);
  if (!record) return null;
  const nested = Array.isArray(record.value) ? record.value[0] : null;
  return asRecord(nested) || record;
}

function cleanContactName(value: unknown, number: string): string {
  if (typeof value !== "string") return "";
  const name = value.trim();
  if (!name) return "";

  const localPart = name.replace(/^\+/, "").split("@")[0];
  const comparable = localPart.replace(/\D/g, "");
  if (comparable === number && !/\p{L}/u.test(localPart)) return "";
  return name;
}

function nameFromRecord(record: UnknownRecord | null, number: string): string {
  if (!record) return "";
  const fields = [
    record.verifiedName,
    record.businessName,
    record.displayName,
    record.pushName,
    record.name,
    record.notify,
    record.profileName,
  ];

  for (const field of fields) {
    const name = cleanContactName(field, number);
    if (name) return name;
  }
  return "";
}

async function resolveWhatsAppName(
  env: EvolutionEnv,
  number: string,
  jid: string
): Promise<string> {
  const config = getEvolutionConfig(env);
  const [
    businessResponse,
    profileResponse,
    contactsResponse,
    chatResponse,
    chatsResponse,
    messagesResponse,
  ] =
    await Promise.all([
      optionalEvolutionRequest(
        env,
        `/chat/fetchBusinessProfile/${config.instance}`,
        { number }
      ),
      optionalEvolutionRequest(env, `/chat/fetchProfile/${config.instance}`, {
        number,
      }),
      optionalEvolutionRequest(env, `/chat/findContacts/${config.instance}`, {
        where: { remoteJid: jid },
      }),
      optionalEvolutionRequest(
        env,
        `/chat/findChatByRemoteJid/${config.instance}?remoteJid=${encodeURIComponent(jid)}`,
        undefined,
        "GET"
      ),
      optionalEvolutionRequest(env, `/chat/findChats/${config.instance}`, {
        where: { remoteJid: jid },
      }),
      optionalEvolutionRequest(env, `/chat/findMessages/${config.instance}`, {
        where: { key: { remoteJid: jid } },
        limit: 50,
        page: 1,
      }),
    ]);

  const chat = firstRecord(chatsResponse);
  const lastMessage = asRecord(chat?.lastMessage);
  const lastMessageKey = asRecord(lastMessage?.key);
  const incomingLastMessage =
    lastMessageKey?.fromMe === false ? lastMessage : null;
  const messagesEnvelope = asRecord(messagesResponse);
  const messages = asRecord(messagesEnvelope?.messages);
  const messageRecords = Array.isArray(messages?.records)
    ? messages.records
        .map(asRecord)
        .filter((record): record is UnknownRecord => Boolean(record))
    : [];
  const incomingMessages = messageRecords.filter((message) => {
    const key = asRecord(message.key);
    return key?.fromMe === false;
  });
  const records = [
    firstRecord(businessResponse),
    firstRecord(profileResponse),
    firstRecord(contactsResponse),
    firstRecord(chatResponse),
    chat,
    incomingLastMessage,
    ...incomingMessages,
  ];

  for (const record of records) {
    const name = nameFromRecord(record, number);
    if (name) return name;
  }
  return "";
}

export async function getWhatsAppContact(
  env: EvolutionEnv,
  number: string,
  options: ContactLookupOptions = {}
): Promise<WhatsAppContact | null> {
  const config = getEvolutionConfig(env);
  const response = await evolutionRequest(
    env,
    `/chat/whatsappNumbers/${config.instance}`,
    { numbers: [number] }
  );

  const results = Array.isArray(response)
    ? response
    : ((response as { value?: unknown[] })?.value ?? []);
  const contact = results[0] as WhatsAppContact | undefined;
  if (!contact?.exists) return null;

  const directName = nameFromRecord(asRecord(contact), number);
  if (directName || options.resolveName === false) {
    return { ...contact, name: directName || undefined };
  }

  const jid = contact.jid || `${number}@s.whatsapp.net`;
  const resolvedName = await resolveWhatsAppName(env, number, jid);
  return { ...contact, name: resolvedName || undefined };
}

export async function isWhatsAppNumber(
  env: EvolutionEnv,
  number: string
): Promise<boolean> {
  return Boolean(await getWhatsAppContact(env, number, { resolveName: false }));
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
