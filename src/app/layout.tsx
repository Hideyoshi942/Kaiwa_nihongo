import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AuthProvider } from "@/components/auth-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaiwa Nihongo — Japanese Conversation Simulator",
  description:
    "Practice real-world Japanese conversations with AI role-play scenarios, instant feedback, and progress tracking.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kaiwa",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#c41e3a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <LocaleProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <MobileBottomNav />
            <ServiceWorkerRegister />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
