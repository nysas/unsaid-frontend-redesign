import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProfileProvider } from "@/components/UserProfileProvider";

export const metadata: Metadata = {
  title: "Unsaid — Some things are easier to say when nobody knows who you are.",
  description:
    "Unsaid is an anonymous peer-advice platform. Ask honestly, hear from people who understand, without anyone knowing it's you.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <UserProfileProvider>{children}</UserProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
