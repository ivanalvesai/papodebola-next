// STUB (Task 1): a Task 2 escreve a versão definitiva com o mesmo contrato. Sem React.
import type { Access, FieldAccess } from "payload";
type U = { roles?: string[] | null } | null | undefined;
export function roles(u: U): string[] { const r = (u?.roles || []) as string[]; return r.length ? r : (u ? ["editor"] : []); }
export function hasRole(u: U, ...r: string[]): boolean { const mine = roles(u); return r.some((x) => mine.includes(x)); }
export const editorOrAdmin: Access = ({ req }) => hasRole(req.user as U, "editor", "admin");
export const fieldEditorOrAdmin: FieldAccess = ({ req }) => hasRole(req.user as U, "editor", "admin");
