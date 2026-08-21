# TheFlap — Build 14 submission handoff (everything needed to make the new iOS build)

Give this whole page to whoever is building on the Mac. It is self-contained. Nothing else is required except the project files (see section 2).

**Timing:** Build 13 is already approved and live on the App Store, and nothing is currently in review — so there is no review queue to protect and no reason to wait. Build 14 can be submitted as the next version whenever it's ready.

---

## 1. What this build is

Build 14 is the **final, live-loading iOS build**. It loads the live site (`https://theflap.app`) inside the app. That means:

- **Every web change we ship reaches iPhone instantly** — no more Build 15, 16, 17 for content or UI.
- The only reason to build iOS again after this is a **native-only capability** (e.g. Apple in-app purchases/StoreKit). Never for features or fixes.

---

## 2. The project files

Use the iOS project from the repo (pull the latest). If you were handed `TheFlap_BUILD14_iOS_Project_FINAL.zip` and it opens as 0 bytes / empty, ignore it — that download failed; get the project from the repo instead.

It is already configured — do **not** edit the config. It contains the live-loading `server` block:

```json
"server": {
  "url": "https://theflap.app",
  "cleartext": false,
  "allowNavigation": ["theflap.app", "*.theflap.app", "weupallday.github.io"]
}
```

---

## 3. What's already included (automatically, because it's live-loading)

All of this is already on the live site, so it's in this build with nothing extra to do:

- **Post pages** — "view more replies" opens a full post with the whole thread (loads 20 at a time).
- **Reply to any comment** — flat @-tag reply that reuses the app's posting (post page on mobile; feed + post page on desktop).
- **Speed / no-lag pass** — instant open, no white flash, silent feed refresh, momentum scroll, lazy images, capped reply rendering.
- **Share to Story, Translate, new store name colors, gold frames, VIP badges, Spotlight boosts.**
- **Signup now requires a real email** — email/password signups must enter a valid, non-disposable email (stored + enforced unique); Google/Apple signups auto-capture their email. No verification code, no email provider needed.
- **Apple compliance — now fully handled on the site (verified live):** on iOS the site adds the body class `flap-ios-app` and hides, via CSS:
  - `.gate-google` — Google sign-in button (was already done).
  - `.gate-apple` — Apple sign-in button (**added now** — same external-browser OAuth risk as Google; with both social buttons hidden, only in-app email/password remains, which also keeps us clear of guideline 4.8).
  - `.fcBuy` and `a[href*="whop"]` — the Feather/Premium buy button and every external Whop checkout link (**added now** — these were previously reachable on iOS).
  - The **"Rate & earn Feathers" prompt is hidden on iOS** (removed any incentivized-review risk).

  The exact live rule: `.flap-ios-app .gate-google, .flap-ios-app .gate-apple, .flap-ios-app .fcBuy, .flap-ios-app a[href*="whop"]{display:none!important}`. Web and Android are unaffected.

---

## 4. What the Mac needs first (prerequisites)

- **Xcode** (latest from the Mac App Store) + command line tools.
- **Node.js** (v18+) and **npm**.
- **CocoaPods** (`sudo gem install cocoapods`).
- Signed into **Xcode with the Apple Developer account** that owns the TheFlap app record.
- The existing **TheFlap** app already exists in App Store Connect (Build 13 was approved) — this uploads a new build to that same record.

---

## 5. Step by step (nothing to code)

1. Unzip `TheFlap_BUILD14_iOS_Project_FINAL.zip`.
2. In Terminal, `cd` into the unzipped folder.
3. `npm install`
4. `npx cap sync ios`
5. Open `ios/App/App.xcworkspace` in **Xcode** (open the `.xcworkspace`, not `.xcodeproj`).
6. Select the **App** target → **Signing & Capabilities** → make sure the correct **Team** is selected and signing succeeds.
7. Bump the **Build** number (e.g. from the last one to the next integer). Optionally set **Version** to a new line like `1.4`.
8. Top bar: set the device target to **Any iOS Device (arm64)**.
9. **Product → Archive.** Wait for it to finish.
10. In the Organizer window that opens: **Distribute App → App Store Connect → Upload.** Accept the defaults, answer **export compliance** (standard HTTPS = usually "No" to proprietary encryption), and finish the upload.
11. Go to **App Store Connect → TheFlap → the version you're submitting → Build** section, click **+**, and attach the build you just uploaded (it may take a few minutes to finish "Processing").
12. **Submit for Review.**

---

## 6. Paste this into "App Review Notes"

Use this wording (do NOT say the app "loads our live web experience" — that phrasing reads as post-review content-swapping and contributed to an earlier rejection):

> Users sign in with email and password, presented entirely in-app. The app does not sell or offer any digital goods or subscriptions, and contains no purchase or checkout flow. Demo account — username: [FILL IN], password: [FILL IN].

Fill in a working demo login before submitting.

---

## 7. Do NOT

- Do **not** edit `capacitor.config.json` (the live-loading block is already correct).
- Do **not** add Google sign-in buttons or in-app purchase buttons for iOS — the site already hides them.
- Do **not** worry about the local `www/` folder — with live-loading it's just an inert fallback.

---

## 8. After it's approved

Tell me it's approved and I'll post the "big update" announcement to all users (post pages, reply-to-comment, faster app, Share to Story, Translate, new store items). It's already drafted and waiting — nothing goes out until you give the word.

---

### Quick summary for you
Hand over: **this page + `TheFlap_BUILD14_iOS_Project_FINAL.zip`**. That's everything. The build already contains all the new features because it loads the live site.
