# TheFlap — Native app (Expo / React Native) — BUILD GUIDE

This is the **100% native** version of TheFlap: a real native app (native list
views, native gestures, native performance) talking to the **same Supabase
backend** as the website. No backend changes — every existing user, flap, and
follow works as-is.

The project files live in the `theflap-native/` folder (hand-off separately, or
push that folder to its own repo). This page is the build guide.

With **EAS Update**, day-to-day JS/UI changes push **over-the-air, no App Store
review** — we keep the instant-update ability the webview had, but now with true
native performance.

---

## What's in this first build (foundation slice)

- Native **login** (username + password, same `flapsalt` SHA-256 hash as web —
  existing passwords just work).
- Native **signup** requiring a real, non-disposable **email** (same rule as web).
- Native **feed** on a virtualized list (`@shopify/flash-list`) with pull-to-
  refresh and smooth cursor-based pagination (no load glitch).
- **Stay-logged-in** session persistence.
- **EAS Update** wired for OTA pushes.

Still to port (backend already exists): post pages / reply threads, DMs, profiles,
store/Feathers, challenges, notifications, admin.

---

## Already configured (nothing to paste)

- Supabase publishable key + URL -> `src/lib/config.ts`.
- Expo project ID `e03f3417-dd80-414f-8adb-b49d4707f4e4` -> `app.json`.
- Bundle ID / package = `com.leoneatelier.theflap` (iOS + Android) -> ships as an
  **update to the existing TheFlap app**, not a new listing.
- Real TheFlap lotus logo -> app icon, Android adaptive icon, splash.

---

## Build it (no Mac required — EAS builds in the cloud)

```bash
cd theflap-native
npm install
npx expo install --fix
npm install -g eas-cli
eas login
eas init --id e03f3417-dd80-414f-8adb-b49d4707f4e4
eas build --platform ios --profile production
eas submit --platform ios --latest
```

For Android: `eas build --platform android --profile production` then
`eas submit --platform android --latest`.

Then in **App Store Connect -> TheFlap -> new version**, attach the build and
**Submit for Review**.

### App Review notes (same wording that got us approved)
> Users sign in with email and password, presented entirely in-app. The app does
> not sell or offer any digital goods or subscriptions, and contains no purchase
> or checkout flow. Demo account — username: TheFlap, password: FlapReview26.

> NOTE: Apple allows one version in review at a time. Submit native **1.4 after
> 1.3 clears review.**

---

## Pushing updates WITHOUT review (the OTA superpower)

After the first store build is live:
```bash
eas update --branch production --message "what changed"
```
Users get it on the next app launch (checked silently on cold start; applied on
the following launch — no jarring mid-session reload).

**The one boundary:** OTA pushes **JS + assets only**. A new native capability
(new native library, new permission, StoreKit/IAP, push, camera) needs a fresh
`eas build` + store submission. Everything else -> OTA.

---

## Files map

| File | Purpose |
|------|---------|
| `App.tsx` | Nav + auth gate + OTA check on launch |
| `src/lib/config.ts` | Supabase URL / key / hash salt |
| `src/lib/supabase.ts` | Shared Supabase client |
| `src/lib/auth.ts` | login / signup / session (same hash as web) |
| `src/lib/flaps.ts` | **Feed query — only place column names live** |
| `src/state/session.tsx` | Logged-in user context |
| `src/screens/*` | Login, Signup, Feed |
| `src/components/FlapCard.tsx` | One feed card (memoized) |
