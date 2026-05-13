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
  const url = src ?? (teamId != null ? `/img/team/${teamId}/image` : null);

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
