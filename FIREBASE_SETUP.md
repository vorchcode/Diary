# Firebase Setup Guide

## Langkah-langkah Setup Firebase untuk Diary

### 1. Buat Firebase Project
1. Buka https://console.firebase.google.com/
2. Klik "Add Project" atau "Create a project"
3. Masukkan nama project (misal: `gentle-harbor-diary`)
4. Pilih lokasi (misal: Southeast Asia)
5. Tunggu project selesai dibuat

### 2. Setup Authentication (Anonymous)
1. Di Firebase Console, pilih project Anda
2. Klik "Authentication" di menu sebelah kiri
3. Klik tab "Sign-in method"
4. Klik "Anonymous" dan aktifkan (toggle ON)
5. Klik "Save"

### 3. Setup Firestore Database
1. Di Firebase Console, klik "Firestore Database" di menu sebelah kiri
2. Klik "Create Database"
3. Pilih lokasi yang sama dengan project
4. Pilih "Start in test mode" (untuk development)
   - ⚠️ **Important**: Test mode expires dalam 30 hari. Untuk production, setup security rules properly.
5. Klik "Enable"

### 4. Ambil Firebase Config
1. Di Firebase Console, klik ⚙️ (Settings icon) di atas > "Project Settings"
2. Scroll ke bawah, cari "Your apps" section
3. Klik pada web app (icon `</>`)
4. Copy config object (apiKey, authDomain, projectId, dll)

### 5. Setup Environment Variables
1. Buat file `.env.local` di root project (copy dari `.env.local.example`):
   ```bash
   cp .env.local.example .env.local
   ```

2. Ganti nilai-nilai di `.env.local` dengan config dari Firebase:
   ```
   VITE_FIREBASE_API_KEY=xxxxxx
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxxx
   VITE_FIREBASE_APP_ID=xxxxxx
   ```

### 6. Install Dependencies
```bash
npm install firebase
# atau
bun install firebase
```

### 7. Restart Dev Server
```bash
npm run dev
# atau
bun run dev
```

## Security Rules untuk Production

Jika ingin deploy ke production, update Firestore security rules:

1. Di Firebase Console, klik "Firestore Database"
2. Klik tab "Rules"
3. Ganti dengan rules ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User hanya bisa read/write diary entries mereka sendiri
    match /diaryEntries/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

4. Klik "Publish"

## Troubleshooting

- **"User not authenticated"**: Pastikan Firebase initialization berhasil
- **Data tidak muncul**: Cek di Firestore console apakah data tersimpan
- **CORS Error**: Pastikan `.env.local` sudah di-setup dengan benar
- **Fallback to localStorage**: Jika Firebase error, app akan otomatis gunakan localStorage

## Testing

1. Buka aplikasi di browser
2. Klik tombol mood (misal: "😢 sad")
3. Ketik cerita
4. Klik "Save Entry"
5. Cek di Firebase Console > Firestore Database > Collection `diaryEntries` - data harus ada
