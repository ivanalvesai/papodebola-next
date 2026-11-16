// nginx do vhost api define X-Real-IP = IP real (via CF-Connecting-IP + set_real_ip_from da Cloudflare).
export function clientIp(h: Headers): string | null {
  const v = h.get("x-real-ip") || h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0];
  return v?.trim() || null;
}
