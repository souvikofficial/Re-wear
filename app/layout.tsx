import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// Optimize Google Fonts loading with Next.js font optimization
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "ReWear - Sustainable Fashion Exchange",
  description:
    "Join our community of conscious fashion lovers. Exchange clothes, earn points, and help reduce textile waste.",
  keywords: ["sustainable fashion", "clothing exchange", "circular economy", "fashion community"],
  authors: [{ name: "ReWear Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8e45ad",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to Google Fonts for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Fallback for older browsers */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Meta tags for better SEO and performance */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
