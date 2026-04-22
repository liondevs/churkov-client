# 🎮 Escape from Churkov — Desktop Client

Electron desktop client for [Escape from Churkov](https://lion.zone.id/) — 3D Multiplayer Top-Down Extraction Shooter.

Includes:
- **Auto-updater** — checks for new version on every launch
- **Splash screen** with download progress
- **Cross-platform builds** — Windows, Linux, macOS
- **Firewall auto-config** on Windows for multiplayer

> ⚠️ **License:** This source code is proprietary and all rights are reserved.
> Viewing is permitted; copying, modifying, or distributing is strictly prohibited.
> See [LICENSE](./LICENSE) for full terms.
---

## 🚀 Quick Start

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- npm (comes with Node.js)
- Git

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/escape-from-churkov-client.git
cd escape-from-churkov-client
npm install
npm start          # Run in production mode (with updater)
npm run dev        # Run in dev mode (skips update check)
```

---

## 🔨 Building

### Windows (from Windows)
```bash
npm run build:win
# Output: dist/Escape from Churkov Setup x.x.x.exe   (installer)
# Output: dist/Escape from Churkov x.x.x.exe          (portable)
```

### Linux (from Linux or CI)
```bash
npm run build:linux
# Output: dist/Escape from Churkov-x.x.x.AppImage
# Output: dist/escape-from-churkov_x.x.x_amd64.deb
```

### macOS (from macOS or CI)
```bash
npm run build:mac
# Output: dist/Escape from Churkov-x.x.x.dmg
# Output: dist/Escape from Churkov-x.x.x-mac.zip
```

### All platforms at once (requires CI — see below)
```bash
npm run build:all
```

> ⚠️ **Cross-compilation note:** You can build for Windows on Windows, Linux on Linux,
> and macOS on macOS. To build for ALL platforms use GitHub Actions (free).

---

## 🔄 Auto-Update Setup

The client uses [electron-updater](https://www.electron.build/auto-update) with **GitHub Releases**.

### Step 1 — Create a GitHub repo for releases

1. Create a new GitHub repo: `escape-from-churkov-releases` (can be private)
2. In `package.json` → `build.publish`, set your GitHub username:
   ```json
   "owner": "YOUR_GITHUB_USERNAME",
   "repo": "escape-from-churkov-releases"
   ```

### Step 2 — Set GH_TOKEN

For local builds that publish to GitHub:
```bash
# Windows (PowerShell)
$env:GH_TOKEN="your_github_personal_access_token"

# Linux/macOS
export GH_TOKEN=your_github_personal_access_token
```

Create a token at: https://github.com/settings/tokens (needs `repo` scope)

### Step 3 — Release a new version

```bash
# 1. Bump version in package.json (e.g. 1.0.1)
# 2. Commit and tag:
git add package.json
git commit -m "Release v1.0.1"
git tag v1.0.1
git push && git push --tags
```

GitHub Actions will automatically build all platforms and publish the release.
The updater reads `latest.yml` / `latest-linux.yml` / `latest-mac.yml` from the release assets.

---

## 📁 Project Structure

```
escape-from-churkov/
├── src/
│   ├── main.js          # Main Electron process + auto-updater
│   ├── preload.js       # Secure IPC bridge
│   ├── logger.js        # File logger for packaged app
│   ├── splash.html      # Splash screen with progress UI
│   └── error.html       # Shown when game server is unreachable
├── build/
│   ├── icon.ico         # Windows icon (256x256) ← ADD THIS
│   ├── icon.icns        # macOS icon ← ADD THIS
│   ├── icons/           # Linux icons (16-512px PNGs) ← ADD THIS
│   ├── installer.nsh    # Custom NSIS script (firewall rules)
│   └── entitlements.mac.plist
├── .github/
│   └── workflows/
│       └── release.yml  # CI/CD for all platforms
├── package.json
└── README.md
```

---

## 🎨 Icons — Required!

You must add icons before building:

| File | Size | Platform |
|------|------|----------|
| `build/icon.ico` | 256×256 | Windows |
| `build/icon.icns` | Multi-size | macOS |
| `build/icons/16x16.png` | 16×16 | Linux |
| `build/icons/32x32.png` | 32×32 | Linux |
| `build/icons/48x48.png` | 48×48 | Linux |
| `build/icons/128x128.png` | 128×128 | Linux |
| `build/icons/256x256.png` | 256×256 | Linux |
| `build/icons/512x512.png` | 512×512 | Linux |

**Convert PNG to ICO/ICNS:**
```bash
# Install ImageMagick then:
magick icon.png -resize 256x256 build/icon.ico

# For ICNS (macOS):
# Use https://cloudconvert.com/png-to-icns or iconutil on macOS
```

---

## ⚙️ Configuration

Edit `src/main.js` top section:

```js
const GAME_URL = 'https://lion.zone.id/';   // Your game URL
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // Check every 30 min while running
```

---

## 🔐 macOS Code Signing (optional)

Without signing, macOS users get a Gatekeeper warning. To sign:
1. Get an Apple Developer account ($99/year)
2. Export your certificate as `.p12`
3. Add GitHub secrets: `MAC_CERTIFICATE`, `MAC_CERTIFICATE_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`
4. Uncomment the signing lines in `.github/workflows/release.yml`
