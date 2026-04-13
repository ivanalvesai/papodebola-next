import Link from "next/link";
import { Goal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Goal className="h-16 w-16 text-text-muted mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-text-primary mb-2">404</h1>
        <p className="text-lg text-text-muted mb-6">
          Pagina nao encontrada
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-green text-white font-semibold rounded-lg hover:bg-green-hover transition-colors"
          >
            Ir para o Inicio
          </Link>
          <Link
            href="/noticias"
            className="px-6 py-2.5 border border-border-custom text-text-secondary font-semibold rounded-lg hover:border-green hover:text-green transition-colors"
          >
            Ver Noticias
          </Link>
        </div>
      </div>
    </div>
  );
}
