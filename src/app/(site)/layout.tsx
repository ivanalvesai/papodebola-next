import type { Metadata } from "next";
import Script from "next/script";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { MainNav } from "@/components/layout/main-nav";
import { SidePanelLoader } from "@/components/layout/side-panel-loader";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { PushPromptModal } from "@/components/push/push-prompt-modal";
import { SidePanelProvider } from "@/components/layout/side-panel-context";
import { MyTeamProvider } from "@/components/layout/my-team-context";
import { SiteSchema } from "@/components/seo/site-schema";
import { getEditableText } from "@/components/editable";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Nome/título/descrição padrão do site são editáveis no painel "Páginas" →
// "Configurações do site" (com fallback nos defaults do registro). O resto
// (metadataBase, OG image, AdSense, ícones) segue fixo no código.
export async function generateMetadata(): Promise<Metadata> {
  const [name, titleDefault, description] = await Promise.all([
    getEditableText("site.name"),
    getEditableText("site.meta.titleDefault"),
    getEditableText("site.meta.descriptionDefault"),
  ]);
  return {
    title: {
      default: titleDefault,
      template: `%s | ${name}`,
    },
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br"
    ),
    openGraph: {
      siteName: name,
      locale: "pt_BR",
      type: "website",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
    },
    other: {
      // Verificacao da conta do Google AdSense (renderiza <meta name="google-adsense-account">)
      "google-adsense-account": "ca-pub-5802007717322888",
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${openSans.variable} antialiased`}>
      <head>
        {/* Antecipa a conexão com o GTM/GA4. (As imagens agora são same-origin via
            Payload /cms-api/media — não precisa mais de preconnect pro WP.) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* GTM em lazyOnload: carrega após o navegador ficar ocioso, sem disputar
            com a hidratação → corta o TBT. O analytics dispara um pouco depois. */}
        <Script id="gtm-head" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MMRXG48R');`}
        </Script>
        <SiteSchema />
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
            <PushPromptModal />
          </SidePanelProvider>
        </MyTeamProvider>
      </body>
    </html>
  );
}
