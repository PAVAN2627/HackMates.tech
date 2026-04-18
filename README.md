# HackMates - Student Innovation Ecosystem

Where ideas transform into impactful products through hackathons, collaboration, and relentless building.

## About

HackMates is a student-led innovation ecosystem focused on building impactful products through hackathons and collaborative development.

## Getting Started

**Local Development**

Clone this repo and start developing locally with your preferred IDE.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

Build the project using `npm run build` and deploy the `dist` folder to your preferred hosting platform.

## Email Service (Google Apps Script)

1. Open the script file at `docs/google-apps-script-email-service.gs`.
2. Create a new Google Apps Script project and paste the script.
3. Deploy it as a Web App with access set to anyone with the link.
4. Copy the Web App URL and add it to `.env`:

```sh
VITE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/your_web_app_id/exec
```

The platform uses this endpoint for:
- Welcome email when an admin creates a new intern or mentor account.
- Attendance email when a mentor marks present or absent.

## Firestore Rules

Role-based security rules are in `firestore.rules`.

Deploy with Firebase CLI:

```sh
firebase deploy --only firestore:rules
```

## Delete Users From Auth + Firestore

Admin user deletion now uses a Firebase Callable Function so deleting a user removes both:
1. Firebase Authentication account
2. Firestore profile document in `users`

Deploy setup:

```sh
cd functions
npm install
cd ..
firebase deploy --only functions
```

After deploy, deleting from the Admin Users page will remove both Auth and Firestore records.
