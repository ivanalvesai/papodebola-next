// Papéis do CMS: admin (tudo), editor (conteúdo), seo (textos e meta).
// Usuário logado sem papel nenhum conta como "editor" (contas antigas, antes dos papéis).
// Sem React e sem @/lib/data: é importado pela config do Payload e pelos testes.
import type { Access, FieldAccess, PayloadRequest } from "payload";

type U = { roles?: string[] | null; id?: string | number } | null | undefined;

export function roles(u: U): string[] {
  const r = (u?.roles || []) as string[];
  return r.length ? r : u ? ["editor"] : [];
}

export function hasRole(u: U, ...r: string[]): boolean {
  const mine = roles(u);
  return r.some((x) => mine.includes(x));
}

export function isAdmin(req: Pick<PayloadRequest, "user"> | null | undefined): boolean {
  return hasRole(req?.user as U, "admin");
}

export const anyLogged: Access = ({ req }) => !!req.user;
export const adminOnly: Access = ({ req }) => hasRole(req.user as U, "admin");
export const editorOrAdmin: Access = ({ req }) => hasRole(req.user as U, "editor", "admin");
export const seoOrEditorOrAdmin: Access = ({ req }) => hasRole(req.user as U, "seo", "editor", "admin");
export const publishedOrLogged: Access = ({ req }) => (req.user ? true : { _status: { equals: "published" } });
export const fieldEditorOrAdmin: FieldAccess = ({ req }) => hasRole(req.user as U, "editor", "admin");
// admin.hidden: some do menu do /cms pra quem não é editor/admin (papel seo).
export const hiddenUnlessEditor = ({ user }: { user: unknown }): boolean => !hasRole(user as U, "editor", "admin");
export const fieldSeoOrEditorOrAdmin: FieldAccess = ({ req }) => hasRole(req.user as U, "seo", "editor", "admin");

// Admin: tudo. Demais: só o próprio documento (com id → compara; sem id, ex. listagem → filtra).
export const selfOrAdmin: Access = ({ req, id }) => {
  const user = req.user as U;
  if (hasRole(user, "admin")) return true;
  if (!user || user.id === undefined || user.id === null) return false;
  if (id === undefined || id === null) return { id: { equals: user.id } };
  return String(user.id) === String(id);
};
