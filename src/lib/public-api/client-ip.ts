// Só X-Real-IP: o nginx do vhost api SEMPRE o sobrescreve com o IP real (CF-Connecting-IP +
// set_real_ip_from da Cloudflare). cf-connecting-ip/x-forwarded-for podem vir forjados do cliente.
export function clientIp(h: Headers): string | null {
  return h.get("x-real-ip")?.trim() || null;
}
