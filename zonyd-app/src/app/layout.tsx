import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zonyd — The Future of Music Distribution",
  description: "Distribuye tu música a Spotify, Apple Music, TikTok y más de 150 tiendas en segundos. Gestiona regalías, analíticas y crece con IA.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zonyd",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Zonyd — The Future of Music Distribution",
    description: "Distribuye tu música globalmente con un clic.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B0B0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-[#0B0B0F] text-white overscroll-none">
        {children}
      </body>
    </html>
  );
}
