import Image from "next/image";

type TeamLogoProps = {
  src?: string | null;
  teamId?: number | string | null;
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
};

export function TeamLogo({
  src,
  teamId,
  alt = "",
  size = 24,
  className = "",
  priority = false,
}: TeamLogoProps) {
  // /api/team-img: arquivo local (volume) → fallback API autenticada. Evita o proxy
  // /img/team (Sofascore), que bloqueia o IP e quebra os escudos.
  const url = src ?? (teamId != null ? `/api/team-img/${teamId}` : null);

  if (!url) {
    return (
      <div
        className={`rounded-full bg-body shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      unoptimized
      priority={priority}
    />
  );
}
