import "./globals.css";
import "../pubsub/subscribers";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ProgressBar from "@/components/progress-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toast } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";
import { AppContextProvider } from "@/context";
import { SWRProvider } from "@/context/SWRProvider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className}`} suppressHydrationWarning={true}>
        <Toast />
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <AppContextProvider>
            <SWRProvider>
              {children}
              <ProgressBar />
            </SWRProvider>
          </AppContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
