# Deployment Guide

This guide covers how to compile and deploy your **SmartTrade** application for Android, iOS, and the Web.

## Prerequisites
1.  **EAS CLI**: Ensure you have the Expo Application Services CLI installed.
    ```bash
    npm install -g eas-cli
    ```
2.  **Expo Account**: You need an account at [expo.dev](https://expo.dev).
    ```bash
    eas login
    ```
3.  **Project Init**: Initialize the project (if you haven't already linked it).
    ```bash
    eas project:init
    ```

---

## 1. Android Build (APK & AAB)

The `eas.json` file is already configured with two profiles for Android:
*   **preview**: Builds a standard `.apk` file that you can install directly on your device for testing.
*   **production**: Builds an `.aab` (Android App Bundle) required for the Google Play Store.

### To Build an APK (For Testing):
```bash
eas build -p android --profile preview
```
*   Once finished, you will get a QR code/link to download the APK.

### To Build an AAB (For Play Store):
```bash
eas build -p android --profile production
```
*   This bundle is optimized for distribution. You can manually upload this to the Google Play Console or configure EAS Submit to do it automatically.

---

## 2. iOS Build

*Note: You need a paid Apple Developer Account to build for distribution.*

### To Build for Internal Distribution (Ad Hoc / TestFlight):
```bash
eas build -p ios --profile preview
```

### To Build for App Store:
```bash
eas build -p ios --profile production
```

---

## 3. Web Deployment (Hosting)

You can deploy the web version of your app to any static hosting provider (Vercel, Netlify, Firebase, GitHub Pages).

### Step A: Export the Web Bundle
Run the following command to compile the web version into a static `dist` folder:
```bash
npx expo export -p web
```
*   This creates a `dist` folder containing your HTML, CSS, and JS.

### Step B: Deploy to Vercel (Recommended)
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run deploy:
    ```bash
    vercel
    ```
3.  Follow the prompts. When asked "Which directory is your code located in?", verify it detects the root. When asked about build settings, you can override the **Output Directory** to `dist` if it doesn't auto-detect.

### Step C: Deploy to Netlify
1.  Install Netlify CLI: `npm i -g netlify-cli`
2.  Run deploy:
    ```bash
    netlify deploy --prod --dir=dist
    ```

---

## Environment Variables
Since you are using Supabase, ensure your `.env` secrets are configured in EAS and your web host.

### For Mobile (EAS):
```bash
eas secret:push
```
*   Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### For Web (Vercel/Netlify):
*   Add the environment variables in the project settings dashboard of your hosting provider.
