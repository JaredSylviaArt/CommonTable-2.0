import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CommonTable - Church Ministry Marketplace",
  description: "A church-only marketplace for ministry staff to share, give away, and sell resources with each other.",
  metadataBase: new URL('https://commontable.vercel.app'),
  openGraph: {
    title: "CommonTable - Church Ministry Marketplace",
    description: "A church-only marketplace for ministry staff to share, give away, and sell resources with each other.",
    url: 'https://commontable.vercel.app',
    siteName: 'CommonTable',
    images: [
      {
        url: 'https://i.postimg.cc/RVCCRTbt/Common-Table-i-Mac-Website-Mockup-1.png',
        width: 1200,
        height: 630,
        alt: 'CommonTable - Church Ministry Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CommonTable - Church Ministry Marketplace",
    description: "A church-only marketplace for ministry staff to share, give away, and sell resources with each other.",
    images: ['https://i.postimg.cc/RVCCRTbt/Common-Table-i-Mac-Website-Mockup-1.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
