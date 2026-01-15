import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareBase - Care Agency Management System",
  description:
    "Streamline operations for home care service providers with end-to-end workflow management.",
  keywords: [
    "care agency",
    "home care",
    "caregiver management",
    "scheduling",
    "healthcare",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
