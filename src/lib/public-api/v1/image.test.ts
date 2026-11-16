import { test } from "node:test";
import assert from "node:assert/strict";
import { imageType } from "./image-type.ts";

test("detecta png/webp/jpeg pelos magic bytes", () => {
  assert.equal(imageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), "image/png");
  assert.equal(imageType(new Uint8Array([...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP")])), "image/webp");
  assert.equal(imageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(imageType(new Uint8Array([1, 2, 3])), null);
});
