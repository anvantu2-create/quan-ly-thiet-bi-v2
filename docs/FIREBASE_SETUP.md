# Thiết lập Firebase cho Giai đoạn 2

1. Bật Firebase Authentication và phương thức Email/Password.
2. Tạo Cloud Firestore tại vùng phù hợp, ưu tiên `asia-southeast1`.
3. Cài Firebase CLI, đăng nhập rồi chạy:
   `firebase deploy --only firestore:rules,firestore:indexes`.
4. Tạo tài liệu `users/{firebaseUid}`:

```json
{"email":"admin@example.com","role":"ADMIN","status":"ACTIVE"}
```

5. Local: đặt `FIREBASE_PROJECT_ID` và `GOOGLE_APPLICATION_CREDENTIALS` trong tệp `.env` không commit.
6. Production: dùng Application Default Credentials/IAM thay cho khóa JSON khi nền tảng hỗ trợ.

Vai trò chuẩn: `ADMIN`, `MANAGER`, `STAFF`, `VIEWER`. Frontend chỉ đọc/ghi qua API; Firestore Rules chặn mọi client write.
