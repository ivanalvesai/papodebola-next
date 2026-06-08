"use client";

import Image from "next/image";
import { useState } from "react";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface PlayerAvatarProps {
  player: string;
  playerId?: number | null;
}

/**
 * Foto do jogador com fallback pras iniciais do nome.
 * A API da Sofascore 404a a foto de muitos jogadores (ex: Vicente Dias Teixeira);
 * sem isso o navegador mostra o ícone de imagem quebrada, que fica feio no site.
 */
export function PlayerAvatar({ player, playerId }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!playerId && !failed;

  return (
    <div className="w-10 h-10 rounded-full bg-body overflow-hidden shrink-0 flex items-center justify-center">
      {showImage ? (
        <Image
          src={`/img/player/${playerId}/image`}
          alt={player}
          width={40}
          height={40}
          className="w-full h-full object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-text-muted text-xs font-bold">{initials(player)}</span>
      )}
    </div>
  );
}
