#!/usr/bin/env bash
# TheFlap -> Real App conversion. Run this INSIDE your TheFlap Capacitor project folder on your Mac.
set -e
echo ""; echo "==== TheFlap -> REAL APP conversion ===="; echo ""
SITE="https://weupallday.github.io"

if [ ! -f capacitor.config.json ] && [ ! -f capacitor.config.ts ]; then
  echo "!! Run this from your TheFlap Capacitor project folder (where capacitor.config lives)."; exit 1
fi

echo "-- 1/6 bundling the UI locally into www/ (this is the 4.3a fix) ..."
mkdir -p www
for f in index.html sw.js manifest.webmanifest icon-192.png icon-512.png privacy.html; do
  curl -fsSL "$SITE/$f" -o "www/$f" 2>/dev/null && echo "   got $f" || echo "   (skip $f)"
done

echo "-- 2/6 writing capacitor.config.json (no server.url = ships local, reads as a real app) ..."
[ -f capacitor.config.json ] && cp capacitor.config.json capacitor.config.json.bak
cat > capacitor.config.json <<'JSON'
{
  "appId": "com.leoneatelier.theflap",
  "appName": "TheFlap",
  "webDir": "www",
  "plugins": {
    "SplashScreen": { "launchShowDuration": 800, "backgroundColor": "#e07d0a", "showSpinner": false },
    "Keyboard": { "resizeOnFullScreen": true }
  }
}
JSON

echo "-- 3/6 installing native plugins ..."
npm install @capacitor/push-notifications @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen @capacitor/haptics @capacitor/app

echo "-- 4/6 adding camera/photo permission strings to Info.plist ..."
PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  setp(){ /usr/libexec/PlistBuddy -c "Add :$1 string $2" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Set :$1 $2" "$PLIST"; }
  setp NSCameraUsageDescription "TheFlap uses your camera so you can take and post photos to your flaps."
  setp NSPhotoLibraryUsageDescription "TheFlap needs access to your photos so you can attach pictures to your flaps and profile."
  setp NSPhotoLibraryAddUsageDescription "TheFlap can save photos you choose to your library."
  setp NSMicrophoneUsageDescription "TheFlap uses your microphone when you record video for your flaps."
  echo "   done"
else echo "   (Info.plist not found at $PLIST - check your iOS project path)"; fi

echo "-- 5/6 fetching app icon + splash ..."
mkdir -p resources
curl -fsSL "$SITE/appicon.png" -o resources/icon.png 2>/dev/null && echo "   got icon" || true
curl -fsSL "$SITE/splash.png" -o resources/splash.png 2>/dev/null && echo "   got splash" || true
npx @capacitor/assets generate --ios 2>/dev/null || echo "   (run 'npx @capacitor/assets generate --ios' to build icon/splash sets)"

echo "-- 6/6 syncing to iOS ..."
npx cap sync ios

echo ""; echo "==== Automated part DONE. Now in Xcode ===="
echo "Run:  npx cap open ios"
echo "  1) App target -> Signing & Capabilities -> + Capability -> Push Notifications; add Background Modes -> Remote notifications."
echo "  2) Bump the Build number (e.g. 3)."
echo "  3) Product -> Run on your iPhone to confirm: camera works, keyboard bar gone, orange status bar, loads instantly from local bundle."
echo "  4) Product -> Archive -> Distribute -> App Store Connect."
echo "  5) In App Store Connect: pick the new build, RESUBMIT, and paste the review note from REAL_APP_REBUILD.md."
echo ""
echo "Push (optional tonight): make an APNs .p8 key at developer.apple.com -> Keys, then deploy the edge function at $SITE/send-push.ts"
echo ""
