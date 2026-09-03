import assert from "node:assert/strict";
import test from "node:test";
import { validateEntity } from "./entities.js";
test("thiết bị hợp lệ dùng REC, không dùng RCL", () => {
  const base = {
    code: "REC-471-01",
    name: "REC 1",
    substationId: "s1",
    feederId: "f1",
    unit: "Đội QLVH",
    status: "CLOSED",
    workingStatus: "ENABLED",
  };
  assert.equal(
    validateEntity("devices", { ...base, deviceType: "REC" }).success,
    true,
  );
  assert.equal(
    validateEntity("devices", { ...base, deviceType: "RCL" }).success,
    false,
  );
});
test("phát tuyến bắt buộc thuộc trạm", () =>
  assert.equal(
    validateEntity("feeders", {
      code: "471",
      name: "471 Phú Chánh",
      status: "ACTIVE",
    }).success,
    false,
  ));
test("cập nhật từng phần được phép", () =>
  assert.equal(
    validateEntity("devices", { status: "OPEN" }, true).success,
    true,
  ));
