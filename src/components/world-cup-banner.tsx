import Link from "next/link";

// A Copa começou (11/06/2026) — banner comemorativo em dourado, "rumo ao hexa".
// (Antes era contagem regressiva pra abertura; removida quando a bola rolou.)
export function WorldCupBanner() {
  return (
    <Link
      href="/futebol/copa-do-mundo/fase/16-avos"
      className="block"
      style={{
        background:
          "linear-gradient(135deg, #8a6c1b 0%, #c9a227 22%, #f3d774 45%, #fbe6a6 52%, #f3d774 60%, #c9a227 80%, #8a6c1b 100%)",
      }}
    >
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-3 px-5 py-3">
        <span
          className="text-center text-[15px] font-extrabold uppercase tracking-wide"
          style={{ color: "#0a4d2e" }}
        >
          A Copa do Mundo começou:{" "}
          <span style={{ color: "#063d22" }}>Rumo ao Hexa!</span>
        </span>
        <span
          className="whitespace-nowrap rounded px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm"
          style={{ background: "#00643f" }}
        >
          Acompanhe
        </span>
      </div>
    </Link>
  );
}
