import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { EnterpriseProvider } from "@/lib/enterprise-context"
import { Providers } from "./providers"
import { ChunkErrorRecovery } from "@/components/chunk-error-recovery"

/*
  FONT: Plus Jakarta Sans
  Weight scale:
    300 — Light (rarely used, fine details)
    400 — Regular (body text, descriptions)
    500 — Medium (emphasized body, field labels)
    600 — SemiBold (card titles, buttons, nav labels)
    700 — Bold (section headers, page subtitles)
    800 — ExtraBold (page titles, display numbers)
  See: globals.css spyne-display / spyne-title / spyne-heading etc.
*/
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Intelligent Console",
  description: "Spyne Intelligent Console for Dealer Operations",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={plusJakartaSans.variable}
    >
      <body className={plusJakartaSans.className}>
        <Providers>
          {/*
            Dark mode: forcedTheme="light" keeps dark mode inactive.
            To enable dark mode: remove forcedTheme prop and set
            defaultTheme="system" or add a theme toggle.
            Dark mode tokens are fully defined in globals.css.
          */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
            disableTransitionOnChange
          >
            <EnterpriseProvider>
              <ChunkErrorRecovery />
              {children}
              <Toaster />
            </EnterpriseProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
