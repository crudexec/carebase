import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/providers/";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Creed",
  description: "Creed - Healthcare Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          {children} <Toaster />
        </Provider>
      </body>
    </html>
  );
}
