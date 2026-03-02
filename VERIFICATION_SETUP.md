# Verification System Setup

## ⚠️ IMPORTANT: Set Firestore Rules First!

### Error: "Missing or insufficient permissions"?
You need to set Firestore security rules. Follow these steps:

1. Go to: https://console.firebase.google.com/
2. Select project: **hackmates-c5972**
3. Click: **Firestore Database** > **Rules** tab
4. Replace ALL rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /verifications/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

---

## Quick Setup

### 1. Install Firebase (Already Done ✅)
```bash
npm install firebase
```

### 2. Run
```bash
npm run dev
```

## Usage

**Admin (Localhost only):** http://localhost:8081/admin
- Login: pavanmali0281@gmail.com / HackMates@0281
- Add verification entries

**Public (Website):** Click "Verify" in navbar
- Enter Offer Letter ID to verify

## Offer Letter ID Format
- Employee: `HM-EMP-2024-001`
- Intern: `HM-INT-2024-001`

## Test Entry Example
- Offer ID: HM-EMP-2024-001
- Name: Test Employee
- Type: Employee
- Position: Software Developer
- Issue Date: 2024-03-03
- Status: Active
