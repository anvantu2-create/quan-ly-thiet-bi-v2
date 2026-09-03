# Quản lý thiết bị lưới điện 22kV — V2

Nền tảng quản lý Trạm 110kV, Phát tuyến, Thiết bị và sơ đồ khép vòng.

## Chạy dự án

```bash
npm install
npm run dev
```

Kiểm tra production: `npm run lint && npm run build`.

## Tình trạng

Mã nguồn MVP đã có Auth/RBAC, CRUD, GIS/ảnh, Topology, đề xuất/phê duyệt,
công việc/checklist, Import/Export, báo cáo aggregation, realtime SSE và offline queue.
Xem [checklist production](docs/PRODUCTION_CHECKLIST.md) trước khi triển khai thực tế.

## Nguyên tắc kiến trúc

- Frontend không ghi trực tiếp Firestore; mọi mutation đi qua backend API.
- Firestore là nguồn chuẩn; truy vấn có phạm vi, phân trang và giới hạn.
- Quyền kiểm tra tại backend; chỉ ADMIN được import.
- Không hardcode secret; dùng biến môi trường.
