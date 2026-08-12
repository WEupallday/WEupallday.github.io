# TheFlap — Build & Upload to TestFlight (start from zero)

**Read this first (30 seconds):**
TheFlap's iOS app is a thin **Capacitor** wrapper. Its config points at the live website
(`https://weupallday.github.io`, served at **theflap.app**). The app **loads the live site at runtime** —
it does **not** bundle the HTML/JS inside the app.

**What that means for you, the builder:**
- You are **not** compiling the app's features. You are wrapping the live website in an iOS shell.
- All you do is: open the project, set the signing team, **bump the build number**, Archive, and upload.
- New features (Feathers, Challenges, Store, cosmetics, admin) appear automatically because they're served
  from the live site — no code goes into the .ipa.

App identity (do not change):
- **App name:** TheFlap
- **Bundle ID:** `com.leoneatelier.theflap`
- **Capacitor:** v6

---

## 0. What you need (fresh Mac)

1. A **Mac** running a recent macOS (Sonoma 14 or newer recommended).
2. **Xcode** — install from the Mac App Store (free, ~10 GB). Open it once and let it install components.
3. **Node.js 20+** — download the macOS installer from https://nodejs.org (LTS). Needed only to sync the project.
4. **CocoaPods** — after Node, in Terminal run: `sudo gem install cocoapods`
5. Access to the **Apple Developer account** for Leone Atelier LLC (the owner will invite you or give access).
   You must be able to select the team in Xcode signing.
6. The **TheFlap iOS project** (next step).

---

## 1. Get the project (from GitHub)

Everything lives on GitHub. Get the iOS project one of two ways:

**Option A — clone the iOS repo (preferred):**
```
git clone <THEFLAP_IOS_REPO_URL>
cd <folder>
```
> The owner will give you the private iOS repo link (the `theflap-ios-build` repo) and add you as a collaborator.

**Option B — use the zip the owner sends:**
Unzip `TheFlap_iOS_Project.zip` to a folder you can write to (e.g. `~/TheFlap`).

Either way you end up with a Capacitor project folder that contains `package.json`, `capacitor.config.json`,
a `www/` folder, and (after the next step) an `ios/` folder.

---

## 2. Install and sync

In Terminal, from the project folder:
```
npm install
npx cap add ios        # only if there is no ios/ folder yet; skip if ios/ already exists
npx cap sync ios        # links native code + config into the ios/ project
```
If `npx cap add ios` says the platform already exists, that's fine — just run `npx cap sync ios`.

This produces/updates `ios/App/App.xcworkspace`.

---

## 3. Open in Xcode

**Open the workspace, not the project:**
```
npx cap open ios
```
(or double-click `ios/App/App.xcworkspace`). Always use **.xcworkspace** — CocoaPods requires it.

---

## 4. Signing (this is the part that needs the Apple account)

1. In Xcode's left sidebar click the blue **App** project → select the **App** target.
2. Go to the **Signing & Capabilities** tab.
3. **Automatically manage signing:** ON.
4. **Team:** choose the **Leone Atelier LLC** team from the dropdown.
5. **Bundle Identifier:** confirm it is exactly `com.leoneatelier.theflap`.

> ⚠️ **KNOWN BLOCKER — read this.** There is an unresolved Apple Developer issue where Apple reports
> *"Unable to find a team with the given Team ID '6N6QM694ZP'."* This is tied to an
> **Individual → Organization account conversion** that is still pending with Apple.
> **If the team does not appear in the dropdown, or upload later fails with a team error,**
> the fix is on Apple's side: contact **Apple Developer Program Support**
> (https://developer.apple.com/contact/) and have them finish the org conversion / re-issue the team.
> You cannot fix this in Xcode. Everything below will work once the team is valid.

---

## 5. Bump the build number (important — do this every upload)

1. Select the **App** target → **General** tab.
2. **Version** (marketing, e.g. `1.3`) — bump if this is a new user-facing version.
3. **Build** — **must be a higher number than the last upload.** If unsure, set it to the next whole number
   (e.g. if the last TestFlight build was 10, use **11**). App Store Connect rejects duplicate build numbers.

You do **not** need to touch anything in `www/` — the app loads the live site.

---

## 6. Archive

1. At the top of Xcode, set the run destination to **Any iOS Device (arm64)**
   (not a simulator — simulators can't be archived for upload).
2. Menu: **Product → Archive**.
3. Wait for the build. When it finishes, the **Organizer** window opens with your archive.

If Archive is greyed out, make sure the destination is "Any iOS Device," not a simulator.

---

## 7. Upload to TestFlight

1. In the **Organizer**, select the new archive → **Distribute App**.
2. Choose **App Store Connect** → **Upload** → Next through the defaults
   (automatic signing, include symbols) → **Upload**.
3. Wait for "Upload Successful."

Then in **App Store Connect** (https://appstoreconnect.apple.com):
1. **My Apps → TheFlap → TestFlight**.
2. The new build shows as **"Processing"** for a few minutes to ~1 hour.
3. When it's ready it may ask for **export-compliance** — TheFlap uses only standard HTTPS encryption,
   so answer that it does **not** use non-exempt encryption (standard "No").
4. Add **Internal Testers** (people on the Apple team) — they get it immediately.
   For outside testers, add an **External** group (that path needs a short Beta App Review).
5. Testers install the free **TestFlight** app from the App Store and accept the invite.

---

## 8. What testers will see

Because the app loads the live site, testers see **whatever is live on theflap.app at the moment they open it**:
- The full **OG TheFlap** experience — feed, posting, search, profiles, moods, following, notifications, existing nav.
- Plus the new **Feathers, Store, cosmetics, Challenges, and admin** once those are deployed live
  (they light up with **no new build** — just refresh/reopen the app).

So this build is future-proof: deploy web updates any time and every TestFlight (and App Store) build picks them up.

---

## Quick command recap
```
# fresh machine, once:
#   install Xcode from App Store; install Node from nodejs.org
sudo gem install cocoapods

# in the project folder:
npm install
npx cap sync ios
npx cap open ios
#   → Xcode: set Team, bump Build number, destination = Any iOS Device,
#     Product → Archive → Distribute App → App Store Connect → Upload
```

## If something goes wrong
- **Team not in dropdown / team-ID error on upload** → Apple-side blocker (section 4). Contact Apple Developer Support.
- **"No profiles found"** → turn Automatic signing OFF then ON, or Xcode → Settings → Accounts → Download Manual Profiles.
- **Archive greyed out** → destination must be "Any iOS Device (arm64)."
- **"Build number already used"** → increase the Build number (section 5) and re-archive.
- **Pod errors** → in `ios/App` run `pod install --repo-update`, then reopen the workspace.
