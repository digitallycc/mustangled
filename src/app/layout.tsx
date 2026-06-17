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
  title: "Mustang LED | Screen Recommendation",
  description:
    "Find the right LED screen for your space. Answer 3 quick questions and get a recommendation on WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-dvh overflow-hidden bg-white text-gray-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
