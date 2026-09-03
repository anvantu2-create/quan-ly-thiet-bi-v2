import assert from'node:assert/strict';import test from'node:test';import{can}from'./rbac.js';
test('VIEWER chỉ có quyền xem',()=>{assert.equal(can('VIEWER','VIEW'),true);assert.equal(can('VIEWER','CREATE'),false);assert.equal(can('VIEWER','DELETE'),false)});
test('chỉ ADMIN được import và quản lý người dùng',()=>{for(const role of['MANAGER','STAFF','VIEWER']as const){assert.equal(can(role,'IMPORT'),false);assert.equal(can(role,'MANAGE_USER'),false)}assert.equal(can('ADMIN','IMPORT'),true);assert.equal(can('ADMIN','MANAGE_USER'),true)});
test('MANAGER được duyệt và giao việc nhưng không xóa',()=>{assert.equal(can('MANAGER','APPROVE'),true);assert.equal(can('MANAGER','ASSIGN'),true);assert.equal(can('MANAGER','DELETE'),false)});
