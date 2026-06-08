import Link from "next/link";
import Image from "next/image";
import { SearchBox } from "./search-box";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border-custom shadow-sm">
      <div className="mx-auto max-w-[1240px] px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/android-chrome-512x512.png"
            alt="Papo de Bola"
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
          <span className="text-lg font-bold text-text-primary tracking-tight">
            PAPO DE BOLA
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <SearchBox />
      </div>
    </header>
  );
}
