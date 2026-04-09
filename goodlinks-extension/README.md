# Save to GoodLinks - Browser Extension

A Chrome/Chromium browser extension that saves the current page to [GoodLinks](https://goodlinks.app). Designed to work seamlessly with pages accessed through library VPNs and DUO authentication — the extension never navigates away from your current page.

## Workflow

1. Navigate to an article (even behind VPN/DUO login)
2. Click the GoodLinks extension icon in your toolbar
3. Optionally edit the title, add tags, or mark as starred
4. Click **Save to GoodLinks**

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `goodlinks-extension` folder

## Save Methods

The extension supports two ways to save links:

### URL Scheme (default)

Uses the `goodlinks://` protocol to send links to the GoodLinks macOS app. No configuration required — just have GoodLinks installed on your Mac.

### Local API Server (recommended for VPN/DUO pages)

Sends a silent background HTTP request to the GoodLinks API server running on your Mac. This is the best option for authenticated/VPN pages because no new tabs are opened and your session is completely undisturbed.

The extension POSTs to `http://localhost:9428/api/v1/links` using `Authorization: Bearer <token>` authentication.

**Setup:**

1. Open **GoodLinks** on your Mac
2. Go to **Settings > API**
3. Enable **API Server** (the default port is `9428`)
4. Copy the **API Token**
5. In the extension, right-click the icon > **Options** (or go to `chrome://extensions/` and click Details > Extension options)
6. Select **Local API Server** as the save method
7. Enter `http://localhost:9428` as the server URL and paste your API token
8. Click **Test Connection** to verify, then **Save Settings**

## Configuration

Right-click the extension icon and select **Options** to configure:

- **Save Method**: URL Scheme or Local API Server
- **API Server URL**: The localhost URL from GoodLinks settings (default port: `9428`)
- **API Token**: The Bearer token from GoodLinks settings
- **Default Tags**: Comma-separated tags to pre-fill when saving

## Browser Compatibility

- Google Chrome (Manifest V3)
- Chromium-based browsers (Edge, Brave, Arc, etc.)
- Firefox — not directly supported (uses Manifest V3); for Firefox, see the [official GoodLinks Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/save-to-goodlinks/)
