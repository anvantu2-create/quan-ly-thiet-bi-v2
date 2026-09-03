# Quản lý thiết bị lưới điện 22kV — V2

Nền tảng quản lý Trạm 110kV, Phát tuyến, Thiết bị và sơ đồ khép vòng.

## Chạy dự án

```bash
npm install
npm run dev
```

Kiểm tra production: `npm run lint && npm run build`.

## Nguyên tắc kiến trúc

- Frontend không ghi trực tiếp Firestore; mọi mutation đi qua backend API.
- Firestore là nguồn chuẩn; truy vấn có phạm vi, phân trang và giới hạn.
- Quyền kiểm tra tại backend; chỉ ADMIN được import.
- Không hardcode secret; dùng biến môi trường.
