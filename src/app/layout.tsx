import type { Metadata } from "next";
import Script from "next/script";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { MainNav } from "@/components/layout/main-nav";
import { SidePanel } from "@/components/layout/side-panel";
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
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.svg",
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
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "wb3iawtabh");`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-body font-sans text-text-primary">
        <MyTeamProvider>
          <SidePanelProvider>
            <Header />
            <MainNav />
            <SidePanel />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </SidePanelProvider>
        </MyTeamProvider>
      </body>
    </html>
  );
}
