import type { LeadTemperature } from "../../shared/presales";
import type { OdooEnv } from "./types";

export interface OdooLeadPayload {
  external_id: string;
  customer_name: string;
  whatsapp_number: string;
  use_case: string;
  environment: string;
  size_category: string;
  recommendation_type: string;
  recommendation_title: string;
  recommendation_explanation: string;
  lead_temperature: LeadTemperature;
  received_at: string;
  source_url: string;
  recommendation_sent: boolean;
  whitepaper_sent: boolean;
  delivery_error: string;
}

export async function upsertOdooLead(
  env: OdooEnv,
  payload: OdooLeadPayload
): Promise<void> {
  const baseUrl = env.ODOO_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl || !env.ODOO_API_TOKEN) {
    throw new Error("Odoo API configuration is incomplete.");
  }

  const response = await fetch(`${baseUrl}/mustang_presales/api/v1/leads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.ODOO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseBody = (await response.text())
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1000);
    const detail = responseBody ? ` Response: ${responseBody}` : "";
    throw new Error(
      `Odoo lead upsert failed with status ${response.status}.${detail}`
    );
  }
}
