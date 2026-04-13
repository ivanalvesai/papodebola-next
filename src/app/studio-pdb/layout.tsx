import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio - Papo de Bola",
  robots: "noindex, nofollow",
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
