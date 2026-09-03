import assert from "node:assert/strict";
import test from "node:test";
import { checklistFor } from "./checklists.js";
test("REC có đúng 10 mục kiểm tra", () =>
  assert.equal(checklistFor("REC").length, 10));
test("LBS có đúng 12 mục kiểm tra", () =>
  assert.equal(checklistFor("LBS").length, 12));
test("loại khác không tự gắn checklist REC/LBS", () =>
  assert.deepEqual(checklistFor("DS"), []));
