# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend Helpers

The `firebase/firestoreService.ts` module exposes helper functions for managing
user plans and feedback data in Firestore. Available functions include:

- `savePlan`, `getUserPlans`, `deletePlan`
- `updatePlan` – update an existing plan
- `filterPlansByMonth` – return plans created in a specific month
- `getStats` – basic plan statistics for the current month
- `submitFeedback` – store feedback in Firestore
- `sendContactEmail` – example helper to trigger an email via EmailJS

All helpers expect the caller to be authenticated with Firebase Auth.
