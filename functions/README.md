# Cloud Functions - User Delete Cleanup

Khi admin xóa user qua backend, backend sẽ:
1. Xóa user khỏi Firebase Auth
2. Xóa document `users/{uid}` trong Firestore

Firebase Auth `onDelete` trigger sẽ tự động chạy và xóa dữ liệu liên quan trong Firestore.

## Deploy

```bash
# 1. Cài Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Init (nếu chưa có firebase.json)
firebase init functions

# 4. Chọn project vstep-writing-lab

# 5. Deploy
cd functions
npm install
npm run build
firebase deploy --only functions
```

## Collections được cleanup

- `users/{uid}`
- `userProgress/{uid}`
- `submissions` (where userId == uid)
- `grading_results` (where studentId == uid)
- `users/{uid}/drafts`
