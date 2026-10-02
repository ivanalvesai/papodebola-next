import { test } from "node:test";
import assert from "node:assert/strict";
import { toSubmissionData, validateRequired, fieldWidthClass, messageKey, type FormField } from "./forms.ts";

const fields: FormField[] = [
  { blockType: "text", name: "nome", label: "Nome", required: true },
  { blockType: "email", name: "email", label: "E-mail", required: true },
  { blockType: "message", name: "aviso" },
  { blockType: "checkbox", name: "aceite", label: "Aceito", required: true },
  { blockType: "number", name: "idade" },
  { blockType: "select", name: "time", options: [{ label: "A", value: "a" }] },
];

test("toSubmissionData ignora message, checkbox vira true/false, resto string", () => {
  const out = toSubmissionData(fields, { nome: "Ana", email: "a@b.c", aviso: "x", aceite: true, idade: 30 });
  assert.deepEqual(out, [
    { field: "nome", value: "Ana" },
    { field: "email", value: "a@b.c" },
    { field: "aceite", value: "true" },
    { field: "idade", value: "30" },
    { field: "time", value: "" },
  ]);
  assert.equal(toSubmissionData(fields, {}).find((d) => d.field === "aceite")?.value, "false");
});

test("validateRequired lista os nomes faltando (checkbox obrigatório precisa estar marcado)", () => {
  assert.deepEqual(validateRequired(fields, {}), ["nome", "email", "aceite"]);
  assert.deepEqual(validateRequired(fields, { nome: "  ", email: "a@b.c", aceite: false }), ["nome", "aceite"]);
  assert.deepEqual(validateRequired(fields, { nome: "Ana", email: "a@b.c", aceite: true }), []);
});

test("fieldWidthClass mapeia porcentagens", () => {
  assert.equal(fieldWidthClass("50"), "sm:w-1/2");
  assert.equal(fieldWidthClass(50), "sm:w-1/2");
  assert.equal(fieldWidthClass("33"), "sm:w-1/3");
  assert.equal(fieldWidthClass("25"), "sm:w-1/4");
  assert.equal(fieldWidthClass("66"), "sm:w-2/3");
  assert.equal(fieldWidthClass("67"), "sm:w-2/3");
  assert.equal(fieldWidthClass("75"), "sm:w-3/4");
  assert.equal(fieldWidthClass("100"), "w-full");
  assert.equal(fieldWidthClass(undefined), "w-full");
});

test("messageKey usa o id do bloco, senão o índice", () => {
  assert.equal(messageKey({ blockType: "message", id: "abc" }, 2), "abc");
  assert.equal(messageKey({ blockType: "message" }, 2), "2");
});
