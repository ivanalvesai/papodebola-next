import type { Metadata } from "next";
import Script from "next/script";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { MainNav } from "@/components/layout/main-nav";
import { SidePanelLoader } from "@/components/layout/side-panel-loader";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { SidePanelProvider } from "@/components/layout/side-panel-context";
import { MyTeamProvider } from "@/components/layout/my-team-context";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Papo de Bola - Futebol Brasileiro e Mundial",
    template: "%s | Papo de Bola",
  },
  description:
    "Portal de futebol brasileiro e mundial com notícias, placares ao vivo, classificações, transferências e muito mais.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br"
  ),
  openGraph: {
    siteName: "Papo de Bola",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${openSans.variable} antialiased`}>
      <head>
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MMRXG48R');`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-body font-sans text-text-primary">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MMRXG48R"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <MyTeamProvider>
          <SidePanelProvider>
            <Header />
            <MainNav />
            <SidePanelLoader />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </SidePanelProvider>
        </MyTeamProvider>
      </body>
    </html>
  );
}
