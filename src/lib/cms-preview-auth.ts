import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

// Acesso ao preview: secret (iframe do Live Preview) OU sessão do /cms (cookie payload-token).
export async function assertPreviewAccess(previewSecret?: string): Promise<boolean> {
  if (process.env.CRON_SECRET && previewSecret === process.env.CRON_SECRET) return true;
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: await headers() });
    return !!user;
  } catch {
    return false;
  }
}
