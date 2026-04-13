import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-footer-bg text-text-inverse mt-auto">
      <div className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-2">Papo de Bola</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Portal de futebol brasileiro e mundial com notícias, placares,
              classificações e muito mais.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide">
              Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/noticias" className="text-text-muted hover:text-white transition-colors">
                  Notícias
                </Link>
              </li>
              <li>
                <Link href="/campeonato/brasileirao-serie-a" className="text-text-muted hover:text-white transition-colors">
                  Brasileirão
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="text-text-muted hover:text-white transition-colors">
                  Agenda
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide">
              Institucional
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="text-text-muted hover:text-white transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-text-muted hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-text-muted hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Papo de Bola. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
