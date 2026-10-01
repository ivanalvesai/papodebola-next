import type { Metadata } from "next";
import { CmsPage, cmsPageMetadata } from "@/components/payload/cms-page-route";

// Páginas do CMS em URL livre. Só chega aqui o que NENHUMA rota em código pegou
// (1 segmento ou 3+; 2 segmentos caem em /[categoria]/[slug], que faz fallthrough).
// ISR: blocos de dados ao vivo rodam aqui, então nunca force-dynamic.
export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const { path } = await params;
  return (await cmsPageMetadata(`/${path.join("/")}`)) || {};
}
export default async function CmsCatchAll({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return <CmsPage path={`/${path.join("/")}`} />;
}
