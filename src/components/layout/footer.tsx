import Link from "next/link";
import { TOURNAMENTS, SPORTS } from "@/lib/config";

const T = TOURNAMENTS;

// Campeonatos em destaque no rodapé (links internos pros silos).
const FOOTER_CHAMPS = [
  { label: "Copa do Mundo 2026", href: "/futebol/copa-do-mundo" },
  { label: T.BRASILEIRAO_A.name, href: `/futebol/${T.BRASILEIRAO_A.slug}` },
  { label: T.BRASILEIRAO_B.name, href: `/futebol/${T.BRASILEIRAO_B.slug}` },
  { label: T.COPA_DO_BRASIL.name, href: `/futebol/${T.COPA_DO_BRASIL.slug}` },
  { label: T.LIBERTADORES.name, href: `/futebol/${T.LIBERTADORES.slug}` },
  { label: T.CHAMPIONS.name, href: `/futebol/${T.CHAMPIONS.slug}` },
];

const FOOTER_LINKS = [
  { label: "Notícias", href: "/noticias" },
  { label: "Jogos de Hoje", href: "/jogos-de-hoje" },
  { label: "Ao Vivo", href: "/ao-vivo" },
  { label: "Seleção Brasileira", href: "/futebol/selecao-brasileira" },
];

const FOOTER_INSTITUTIONAL = [
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Política de Privacidade", href: "/privacidade" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-text-muted hover:text-white transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const sportLinks = SPORTS.map((s) => ({ label: s.name, href: s.href }));

  return (
    <footer className="bg-footer-bg text-text-inverse mt-auto">
      <div className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold mb-2">Papo de Bola</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Portal de futebol brasileiro e mundial com notícias, placares,
              classificações e muito mais.
            </p>
          </div>

          <FooterColumn title="Campeonatos" links={FOOTER_CHAMPS} />
          <FooterColumn title="Esportes" links={sportLinks} />
          <FooterColumn title="Links" links={FOOTER_LINKS} />
          <FooterColumn title="Institucional" links={FOOTER_INSTITUTIONAL} />
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-text-muted">
          &copy; 2004&ndash;{new Date().getFullYear()} Papo de Bola. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
