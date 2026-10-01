import type { CollectionConfig } from "payload";
import { adminOnly, hasRole, selfOrAdmin } from "@/cms/lib/access";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Usuários do CMS com papéis. `access.admin: () => true` mantém o /cms aberto pra
// qualquer logado — os papéis escondem o que cada um não usa.
export const usersCollection: CollectionConfig = {
  slug: "users",
  labels: { singular: "Usuário", plural: "Usuários" },
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Sistema",
    defaultColumns: ["email", "name", "roles"],
    hidden: ({ user }) => !hasRole(user as any, "admin"),
  },
  access: { read: selfOrAdmin, create: adminOnly, update: selfOrAdmin, delete: adminOnly, admin: () => true },
  fields: [
    { name: "name", type: "text", label: "Nome" },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["editor"],
      saveToJWT: true,
      label: "Papéis",
      options: [
        { label: "Administrador (tudo)", value: "admin" },
        { label: "Editor (conteúdo)", value: "editor" },
        { label: "SEO (textos e meta)", value: "seo" },
      ],
      access: { update: ({ req }) => hasRole(req.user as any, "admin") },
    },
  ],
};
