# TheFlap — Native app (Expo / React Native)

This is the **100% native** version of TheFlap. It is a real native app (native
list views, native gestures, native performance) that talks to the **same
Supabase backend** as the website. No backend changes — every existing user,
flap, and follow works as-is.

The big win: with **EAS Update**, day-to-day JS/UI changes push **over-the-air,
no App Store review** — we keep the instant-update ability the webview had, but
now with true native performance.

---

## What's in this build

Core social app, all native, all on the existing Supabase backend:

- **Login / signup** — same `flapsalt` SHA-256 hash as web (existing passwords
  work); signup requires a real, non-disposable email. Stay-logged-in.
- **Feed** — virtualized `@shopify/flash-list`, pull-to-refresh, smooth cursor
  pagination, floating compose button.
- **Compose** — post a flap with a mood.
- **Post page** — full flap + replies, add a reply.
- **Profiles** — avatar, follower count, follow/unfollow, that user's flaps.
- **Search** — find people by name.
- **Notifications** — your alerts feed.
- **Messages** — conversation list + 1:1 chat (send/receive).
- **Store** — Feathers balance + owned items. Purchase UI is hidden on iOS
  (Apple compliance); packs/Premium stay web + Android only.
- **Settings** — account info + sign out.
- **EAS Update** wired for OTA pushes.

Bottom-tab navigation: Home · Search · Alerts · DMs · Me.

Still to port later: challenges, admin panel, badges/verification cosmetics,
push notifications. Backends for these already exist.

### Verify column names before shipping
Table/column names for replies, notifications, messages, and Feathers are
best-guess and marked `// VERIFY` in `src/lib/api.ts` (`TABLES` map at top).
Confirmed ones (users, flaps, follows, store_owned) are correct. Check the
VERIFY ones against Supabase → Table editor and adjust in that one file.

---

## One-time setup

### 1. Already configured (nothing to do)
- Supabase publishable key + URL → set in `src/lib/config.ts`.
- Expo project ID (`e03f3417-dd80-414f-8adb-b49d4707f4e4`) → set in `app.json`
  (OTA update URL + `extra.eas.projectId`).
- Bundle ID / package = `com.leoneatelier.theflap` (iOS + Android) → this ships
  as an **update to the existing TheFlap app**, not a new listing.
- Real TheFlap lotus logo → app icon, Android adaptive icon, and splash.

### 2. Install (no Mac required — EAS builds in the cloud)
```bash
cd theflap-native
npm install
npx expo install --fix     # aligns native deps to the installed Expo SDK
npx expo-doctor            # sanity check
```

### 3. Link the existing EAS project (already created)
```bash
npm install -g eas-cli
eas login                  # the Expo account for TheFlap
eas init --id e03f3417-dd80-414f-8adb-b49d4707f4e4   # links this repo to the project
```
The project ID is already set in `app.json`, so nothing to paste.

---

## Build & submit (first store build)

The **first** build must go through the App Store / Play Store normally. After
that, JS changes go out via OTA.

### iOS
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```
Then in **App Store Connect → TheFlap → new version**, attach the build and
**Submit for Review**.

**App Review notes** (same wording that got us approved):
> Users sign in with email and password, presented entirely in-app. The app does
> not sell or offer any digital goods or subscriptions, and contains no purchase
> or checkout flow. Demo account — username: TheFlap, password: FlapReview26.

### Android
```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

---

## Pushing an update WITHOUT review (the OTA superpower)

After the store build is live, any change to JS/TS/assets ships instantly:
```bash
eas update --branch production --message "what changed"
```
Users get it on their next app launch (checked silently on cold start; applied on
the following launch — no jarring mid-session reload).

### The one boundary
OTA pushes **JS + assets only**. If you add a **new native capability** (a new
native library, a new permission, StoreKit/IAP, push, camera, etc.), that needs a
fresh `eas build` + store submission. Everything else → OTA.

Also: OTA updates are tied to the `runtimeVersion` (set to `appVersion` policy).
When you cut a new native build, bump the app version so updates line up.

---

## Files map

| File | Purpose |
|------|---------|
| `App.tsx` | Nav + auth gate + OTA check on launch |
| `src/lib/config.ts` | Supabase URL / anon key / hash salt |
| `src/lib/supabase.ts` | Shared Supabase client |
| `src/lib/auth.ts` | login / signup / session (same hash as web) |
| `src/lib/flaps.ts` | **Feed query — the only place column names live** |
| `src/state/session.tsx` | Logged-in user context |
| `src/screens/*` | Login, Signup, Feed |
| `src/components/FlapCard.tsx` | One feed card (memoized) |

> If a `flaps` column name differs in the live DB, fix it in **`src/lib/flaps.ts`
> only** (`COLS` / `ORDER_COL`). Confirm against Supabase → Table editor → `flaps`.
