# Checklist bàn giao production

## Cấu hình bắt buộc

- Thiết lập toàn bộ biến trong `.env.example` tại nền tảng chạy; không commit `.env`.
- Bật Firebase Authentication Email/Password.
- Tạo hồ sơ `users/{uid}` cho ADMIN đầu tiên với `status: ACTIVE`, `role: ADMIN`, `version: 1`, `deletedAt: null`.
- Deploy `firestore.rules` và `firestore.indexes.json`.
- Cấp IAM tối thiểu cho backend và cấu hình Firebase Storage bucket.
- Đặt `NODE_ENV=production` và `ALLOWED_ORIGINS` đúng domain thật.

## Kiểm thử runtime bắt buộc

1. Đăng nhập ADMIN/MANAGER/STAFF/VIEWER; kiểm tra `/api/auth/me`.
2. VIEWER chỉ GET; mọi mutation phải trả 403.
3. CRUD Trạm → Phát tuyến → Thiết bị; thử xung đột version phải trả 409.
4. Import file có mã trùng và quan hệ sai phải bị từ chối, không ghi một phần.
5. Upload JPEG/PNG/WebP dưới 5 MB; file sai loại hoặc quá dung lượng phải bị từ chối.
6. Tạo đề xuất bằng STAFF; người tạo không tự duyệt; MANAGER/ADMIN duyệt thành công.
7. Giao công việc REC/LBS; xác nhận checklist lần lượt 10/12 mục và STAFF khác không xem được.
8. Hai trình duyệt A/B: A cập nhật thiết bị, B nhận đúng một SSE event rồi tải version mới.
9. Gửi lại cùng `operationId`: không ghi hoặc phát event lần hai.
10. Ngắt mạng, tạo/sửa một bản ghi, kết nối lại và xác nhận queue đồng bộ đúng một lần.
11. Đăng xuất hoặc token sai: SSE/API trả 401 và không retry liên tục.
12. Kiểm tra Audit Logs không chứa token, secret hoặc mật khẩu.

Chỉ đánh dấu READY FOR PRODUCTION khi toàn bộ bài runtime trên có bằng chứng thực tế.
