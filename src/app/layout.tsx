import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mustangled.aitechworx.com"),
  title: "Mustang LED | SMD Screen Advisor",
  description:
    "Answer three quick questions and receive a personalized SMD screen recommendation from Mustang LED on WhatsApp.",
  openGraph: {
    title: "Find the Right SMD Screen | Mustang LED",
    description:
      "Answer three quick questions and receive a personalized SMD screen recommendation from Mustang LED on WhatsApp.",
    url: "/",
    siteName: "Mustang LED",
    type: "website",
    images: [
      {
        url: "/mustangled.jpg",
        width: 1024,
        height: 1024,
        alt: "Mustang LED SMD display installation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find the Right SMD Screen | Mustang LED",
    description:
      "Answer three quick questions and receive a personalized SMD screen recommendation from Mustang LED on WhatsApp.",
    images: ["/mustangled.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-dvh min-h-0 overflow-hidden text-gray-900 flex flex-col" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ffffff 40%, #f0f9ff 100%)" }}>
        {children}
      </body>
    </html>
  );
}
