# EAS OTA Updates Guide

This project is configured to use **EAS Update** for Over-The-Air (OTA) updates. This allows you to deploy changes to JavaScript code and assets (images, fonts) directly to user's devices without requiring a full store review or a new native build.

## Prerequisites

The project has already been configured with:

1.  `expo-updates` library installed.
2.  `app.config.ts` configured with `updates.url` and `runtimeVersion`.
3.  `eas.json` configured with `channel` properties for `preview` and `production` builds.

## Workflow

### 1. Initial Setup (One-time or after config changes)

Whenever you install a **native module** (changes `ios/`, `android/` directories or requires `pod install`) or change the `runtimeVersion` policy, you essentially create a new native runtime. You MUST build and submit a new binary to the app stores.

```bash
# Production build
eas build --profile production --platform ios
```

This build will include the logic to "listen" for updates on the `production` channel.

### 2. Publishing an Update (Code/Asset changes only)

If you have only modified JavaScript/TypeScript code, styles, or assets (like images in your bundle), you can push an update instantly.

```bash
# Publish changes to the production channel
eas update --branch production --message "Fixing login bug"
```

**Note:** Ensure you target the correct branch that maps to the channel your build is listening to. In our `eas.json`, the `production` profile is linked to the `production` channel.

### 3. Testing Updates

You can test changes in a similar way using the `preview` profile.

1.  Build the preview client:
    ```bash
    eas build --profile preview --platform ios
    ```
2.  Publish updates to the preview channel:
    ```bash
    eas update --branch preview --message "Testing new feature feature"
    ```

## Important Rules

- **Native Changes = Native Build:** If you add a library like `react-native-camera` or change a value in `ios/Info.plist`, an OTA update **will not work** and could crash the app. You must build a new binary (`eas build`).
- **Runtime Version Compatibility:** Creates updates that are compatible with the specific native runtime version. We are currently using `policy: "appVersion"`, meaning updates are tied to the version number in `package.json`. If you bump the version in `package.json`, you should generally build a new binary.

## Troubleshooting

- **Update not showing up?**
  - Check if the `runtimeVersion` of the update matches the `runtimeVersion` of the installed build.
  - Check if the channel matches (e.g., sending a `preview` update to a `production` build will not work).
  - Force close and reopen the app (updates are usually downloaded in the background and applied on next launch).
