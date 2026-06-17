export const clientConfig = {
  slug: "mustang-led",
  companyName: "Mustang LED",
  businessWhatsappNumber: "923XXXXXXXXX",
  brandPrimaryColor: "#25D366",
  brandLogoUrl: "/clients/mustang-led/logo.png",
  websiteUrl: "https://mustangled.com",
} as const;

export type ClientConfig = typeof clientConfig;