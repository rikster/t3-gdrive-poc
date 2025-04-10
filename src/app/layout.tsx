import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { DriveProvider } from "~/contexts/DriveContext";
import { AuthWrapper } from "../components/AuthWrapper";

export const metadata: Metadata = {
  title: "StrataFusion",
  description: "Unified Cloud Storage",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <DriveProvider>
              <AuthWrapper>
                {children}
              </AuthWrapper>
            </DriveProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
