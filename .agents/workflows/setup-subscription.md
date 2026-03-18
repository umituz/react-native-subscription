---
description: Sets up or updates the @umituz/react-native-subscription package in a React Native app.
---

# Subscription Setup Skill

When this workflow/skill is invoked, follow these precise steps to set up or update the `@umituz/react-native-subscription` package in the current project.

## Step 1: Check and Update `package.json`
- Locate the target project's `package.json` file.
- Check if `@umituz/react-native-subscription` is installed in `dependencies`.
  - If missing: Install the package using `npm install @umituz/react-native-subscription`.
  - If outdated: Update it to the latest version.

## Step 2: Ensure Peer Dependencies
Ensure the following peer dependencies are present in `package.json`. If missing, install them:
- `react-native-purchases`
- `@react-native-async-storage/async-storage`
- `zustand`
- `@tanstack/react-query`
*(Note: If the project uses Expo, run `npx expo install` for expo-supported packages like async-storage, otherwise standard `npm install`)*

// turbo
## Step 3: Run Pod Install (If bare React Native)
If there is an `ios/` folder in the project and `Podfile` exists, run:
```bash
cd ios && pod install
```

## Step 4: Inject Provider Boilerplate
- Locate the main entry or root layout file of the app (e.g., `App.tsx`, `src/App.tsx`, or Expo Router's `app/_layout.tsx`).
- Ensure the app is wrapped with `SubscriptionFlowProvider` or any required top-level providers exported from `@umituz/react-native-subscription`.
- Import the needed components:
  ```typescript
  import { SubscriptionFlowProvider, initializeSubscription } from '@umituz/react-native-subscription';
  ```
- Make sure `initializeSubscription` is called somewhere appropriate (e.g., inside an `useEffect` or initialization module) with the API Keys from the environment.
- If API keys (like `REVENUECAT_APPLE_KEY` or `REVENUECAT_GOOGLE_KEY`) are missing, prompt the user to add them to their `.env` file.

## Step 5: Summary
Provide a brief summary of what you did: which packages were installed/updated, and which files were modified to inject the subscription boilerplate.
