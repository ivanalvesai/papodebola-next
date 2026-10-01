import { test } from "node:test";
import assert from "node:assert/strict";
import { hasRole, editorOrAdmin, seoOrEditorOrAdmin, publishedOrLogged, fieldEditorOrAdmin, adminOnly, anyLogged, selfOrAdmin } from "./access.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
const req = (roles?: string[], id?: number) => ({ req: { user: roles ? { roles, id } : null } } as any);

test("hasRole", () => {
  assert.equal(hasRole({ roles: ["seo"] }, "seo", "admin"), true);
  assert.equal(hasRole({ roles: [] }, "admin"), false);
  assert.equal(hasRole(null, "admin"), false);
});

test("sem roles conta como editor", () => {
  assert.equal(editorOrAdmin(req([])), true);
  assert.equal(editorOrAdmin(req(["seo"])), false);
  assert.equal(editorOrAdmin(req(undefined)), false);
});

test("seoOrEditorOrAdmin e publishedOrLogged", () => {
  assert.equal(seoOrEditorOrAdmin(req(["seo"])), true);
  assert.deepEqual(publishedOrLogged(req(undefined)), { _status: { equals: "published" } });
  assert.equal(publishedOrLogged(req(["editor"])), true);
});

test("fieldEditorOrAdmin", () => {
  assert.equal(fieldEditorOrAdmin(req(["seo"])), false);
  assert.equal(fieldEditorOrAdmin(req(["admin"])), true);
});

test("adminOnly, anyLogged e selfOrAdmin", () => {
  assert.equal(adminOnly(req(["editor"])), false);
  assert.equal(adminOnly(req(["admin"])), true);
  assert.equal(anyLogged(req(undefined)), false);
  assert.equal(anyLogged(req(["seo"])), true);
  assert.equal(selfOrAdmin({ ...req(["seo"], 7), id: 7 }), true);
  assert.equal(selfOrAdmin({ ...req(["seo"], 7), id: 8 }), false);
  assert.equal(selfOrAdmin({ ...req(["admin"], 1), id: 8 }), true);
  assert.equal(selfOrAdmin({ ...req(undefined), id: 8 }), false);
});

test("selfOrAdmin sem id filtra pelo próprio usuário", () => {
  assert.deepEqual(selfOrAdmin(req(["editor"], 7)), { id: { equals: 7 } });
});
