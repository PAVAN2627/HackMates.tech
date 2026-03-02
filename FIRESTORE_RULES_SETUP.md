# Firestore Rules Setup - IMPORTANT!

## Error: Missing or insufficient permissions

This error occurs because Firestore security rules are not set up yet.

## How to Fix:

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Select your project: **hackmates-c5972**

### Step 2: Navigate to Firestore Rules
1. Click on **Firestore Database** in the left menu
2. Click on the **Rules** tab at the top

### Step 3: Copy and Paste These Rules

Replace ALL existing rules with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to verifications
    match /verifications/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 4: Publish
Click the **Publish** button

## What These Rules Do:

✅ **allow read: if true** - Anyone can READ verification data (for public verify page)
✅ **allow write: if request.auth != null** - Only authenticated users can WRITE/UPDATE/DELETE (for admin dashboard)

## After Publishing:

1. Go back to your admin dashboard: http://localhost:8081/admin
2. Try adding a verification entry again
3. It should work now! ✅

## Test Entry Example:

- **Offer ID:** HM-EMP-2024-001
- **Name:** Test Employee
- **Type:** Employee
- **Position:** Software Developer
- **Issue Date:** 2024-03-03
- **Status:** Active

---

If you still get errors after setting rules, make sure you're logged in with: pavanmali0281@gmail.com
