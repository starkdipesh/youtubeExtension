# Development Guide - YouTube Channel Restrictor

This guide covers the technical architecture and development setup for the YouTube Channel Restrictor extension.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│        Chrome Extension Framework            │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │   Popup Script (popup.js)             │   │
│  │   - Settings management              │   │
│  │   - User input validation            │   │
│  │   - Storage interface                │   │
│  └──────────────────────────────────────┘   │
│                    ▲                         │
│                    │ messages                │
│                    ▼                         │
│  ┌──────────────────────────────────────┐   │
│  │   Service Worker (background.js)     │   │
│  │   - Message routing                  │   │
│  │   - Storage management               │   │
│  │   - Extension lifecycle              │   │
│  └──────────────────────────────────────┘   │
│                    ▲                         │
│                    │ messages                │
│                    ▼                         │
│  ┌──────────────────────────────────────┐   │
│  │   Content Script (content.js)        │   │
│  │   - YouTube DOM manipulation         │   │
│  │   - Video monitoring                 │   │
│  │   - Channel validation               │   │
│  │   - Auto-play logic                  │   │
│  └──────────────────────────────────────┘   │
│                    ▲                         │
│                    │ YouTube API events      │
│                    ▼                         │
│  ┌──────────────────────────────────────┐   │
│  │        YouTube.com Website           │   │
│  │   - Video elements                   │   │
│  │   - Up Next sidebar                  │   │
│  │   - Navigation events                │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
```

## 📁 File Responsibilities

### `manifest.json`
- **Purpose**: Extension configuration and permissions
- **Key Sections**:
  - `manifest_version: 3` - Uses latest Chrome API
  - `permissions` - Declares capabilities needed
  - `host_permissions` - YouTube.com access
  - `content_scripts` - Injection configuration
  - `background.service_worker` - Background script

### `content.js`
- **Purpose**: Main extension logic on YouTube pages
- **Responsibilities**:
  - Monitor video element lifecycle
  - Detect channel ID of current video
  - Block unauthorized videos
  - Scan for next video in recommendations
  - Handle auto-play logic
  - Display overlays and notifications
  - Listen for SPA navigation events

### `background.js`
- **Purpose**: Service worker for extension management
- **Responsibilities**:
  - Handle extension installation/update
  - Route messages between popup and content script
  - Manage storage operations
  - Initialize extension on startup

### `popup.html` / `popup.css` / `popup.js`
- **Purpose**: User settings interface
- **Responsibilities**:
  - Display configuration UI
  - Validate user input
  - Save/load settings
  - Provide test functionality
  - Show status messages

## 🔄 Data Flow

### 1. Initial Setup Flow

```
User clicks extension icon
        ↓
popup.html loads
        ↓
popup.js runs DOMContentLoaded
        ↓
chrome.storage.sync.get() loads saved settings
        ↓
Display in form inputs
```

### 2. Settings Save Flow

```
User clicks Save button
        ↓
popup.js calls validateChannelId()
        ↓
chrome.storage.sync.set() saves data
        ↓
Loop through all YouTube tabs
        ↓
Send 'settingsUpdated' message to each
        ↓
Show success overlay
```

### 3. YouTube Video Monitoring Flow

```
content.js initializes
        ↓
chrome.storage.sync.get() retrieves channel ID
        ↓
monitorCurrentVideo() finds <video> element
        ↓
blockUnauthorizedContent() checks channel
        ↓
Attach 'ended' event listener
        ↓
User watches video until end
        ↓
'ended' event fires
        ↓
playNextVideoFromChannel() scans Up Next
        ↓
If found: click video link
  Else: fallbackToChannel() redirects to channel
        ↓
Loop back to monitoring
```

### 4. SPA Navigation Flow

```
User clicks video recommendation
        ↓
YouTube SPA updates without page reload
        ↓
yt-navigate-finish event fires
        ↓
content.js event listener triggers
        ↓
Remove old video monitoring
        ↓
blockUnauthorizedContent() validates new video
        ↓
monitorCurrentVideo() sets up new listener
```

## 🔌 Core Functions

### content.js Functions

#### `init()`
```javascript
// Initializes extension on page load
// Retrieves stored channel ID
// Starts monitoring and event listeners
```

#### `getCurrentVideoChannelId()`
```javascript
// Returns: Promise<string | null>
// Extracts channel ID from current video
// Uses multiple fallback methods for reliability
```

#### `blockUnauthorizedContent()`
```javascript
// Validates current video's channel
// If unauthorized:
//   - Shows blocking overlay
//   - Pauses video
//   - Redirects to allowed channel
```

#### `monitorCurrentVideo()`
```javascript
// Sets up video element monitoring
// Attaches 'ended' event listener
// Re-runs on dynamic content loads
```

#### `playNextVideoFromChannel()`
```javascript
// Returns: Promise<boolean>
// Scans 'Up Next' sidebar
// Finds first video from CHANNEL_ID
// Returns true if found and clicked, false otherwise
```

#### `fallbackToChannel()`
```javascript
// Redirects to: youtube.com/channel/[CHANNEL_ID]/videos
// Called when no matching videos in sidebar
```

#### `listenForNavigation()`
```javascript
// Listens for 'yt-navigate-finish' events
// Listens for window 'popstate' (back/forward)
// Re-initializes monitoring on navigation
```

### popup.js Functions

#### `loadSettings()`
```javascript
// Retrieves saved channel ID and name
// Populates form inputs
```

#### `validateChannelId(channelId)`
```javascript
// Returns: boolean
// Validates format: UC + 22 characters
// Prevents invalid data entry
```

#### `saveSettings()`
```javascript
// Validates both inputs
// Saves to chrome.storage.sync
// Notifies all YouTube tabs
// Shows success/error messages
```

#### `showStatus(message, type)`
```javascript
// type: 'success' | 'error' | 'info'
// Displays temporary status message
// Auto-hides after 3 seconds for success
```

### background.js Functions

#### `chrome.runtime.onInstalled.addListener()`
```javascript
// Handles first installation
// Called on update
// Can open welcome page
```

#### Message handlers
```javascript
// 'getChannelData': Retrieve stored settings
// 'setChannelData': Save new settings
// Used for communication between components
```

## 🧪 Testing Guide

### Manual Testing Checklist

1. **Installation**
   - [ ] Load unpacked extension
   - [ ] Extension icon appears in toolbar
   - [ ] Popup appears on click

2. **Configuration**
   - [ ] Can enter valid channel ID
   - [ ] Can enter display name
   - [ ] Settings persist after reload
   - [ ] Can clear settings

3. **Video Monitoring**
   - [ ] Navigate to any YouTube video
   - [ ] Video element found and monitored
   - [ ] Open browser DevTools console
   - [ ] Check for `[YTR]` log messages

4. **Channel Validation**
   - [ ] Navigate to video from allowed channel
     - [ ] No overlay appears
     - [ ] Video plays normally
   - [ ] Navigate to video from other channel
     - [ ] Overlay appears
     - [ ] Video pauses
     - [ ] Redirects to allowed channel

5. **Auto-Play Next**
   - [ ] Play video from allowed channel
   - [ ] Let it finish
   - [ ] Check if next video from same channel plays
   - [ ] Verify overlay shows "Finding next video..."

6. **Fallback Behavior**
   - [ ] Navigate to video from allowed channel
   - [ ] Ensure Up Next is mostly irrelevant content
   - [ ] Let video finish
   - [ ] Should redirect to channel videos page
   - [ ] Latest video should start playing

7. **SPA Navigation**
   - [ ] Play video from allowed channel
   - [ ] While playing, click another video
   - [ ] Should re-initialize monitoring
   - [ ] Repeat step 4 checks

### Console Debugging

Open DevTools (F12) and check Console tab for logs:

```javascript
[YTR] Initialized with channel: Channel Name UCXXX
[YTR] Video element found, setting up monitoring
[YTR] Video ended, looking for next video...
[YTR] Found matching video, playing...
[YTR] Navigation detected, re-initializing
```

### Testing Different Scenarios

#### Scenario 1: Allowed Channel Video
```
1. Extension configured with Channel A
2. Navigate to Channel A video
3. Expected: Video plays, monitoring active
4. Result: ✅ Success if no blocking overlay
```

#### Scenario 2: Unauthorized Channel Video
```
1. Extension configured with Channel A
2. Navigate to Channel B video
3. Expected: Overlay appears, redirects to Channel A
4. Result: ✅ Success if redirected within 3 seconds
```

#### Scenario 3: Auto-Play Chain
```
1. Play video from Channel A
2. Let it finish
3. Watch second video from Channel A finish
4. Watch third video from Channel A finish
5. Expected: Continuous playback of Channel A videos
6. Result: ✅ Success if chain continues
```

## 📊 Debugging Techniques

### Enable Detailed Logging

Add this to the top of content.js:

```javascript
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log('[YTR DEBUG]', ...args);
}
```

Then replace `console.log` calls with `log()` calls.

### Monitor DOM Changes

```javascript
// Add to content.js to see all mutations
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,  // Add attribute monitoring
  attributeFilter: ['href', 'data-video-id']
});

observer.addEventListener('mutation', (mutations) => {
  console.log('[YTR] DOM mutations:', mutations.length);
});
```

### Watch Storage Changes

```javascript
// Test storage sync
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('[YTR] Storage changed:', changes, namespace);
});
```

### Validate CSS Injection

```javascript
// In console on YouTube page
document.getElementById('ytr-styles') // Should exist
document.querySelector('.ytr-overlay') // Should exist when displayed
```

## 🔐 Security Considerations

### Content Security Policy

Manifest V3 has strict CSP by default:
- ✅ Inline styles in `<style>` tags are allowed
- ✅ External CSS files are allowed
- ❌ Inline event handlers are blocked
- ❌ `eval()` is blocked

Current implementation is CSP-compliant.

### Storage Security

- All data stored in `chrome.storage.sync`
- Encrypted by Chrome automatically
- Syncs across user's devices if logged in
- Respects Chrome's privacy settings

### DOM Manipulation Safety

- Only manipulating YouTube's own elements
- Not injecting arbitrary HTML
- Using `textContent` not `innerHTML`
- Event listeners properly cleaned up

## 📦 Packaging for Distribution

### Creating .crx File

```bash
# Via command line (requires Chrome)
google-chrome --pack-extension=/path/to/extension \
  --pack-extension-key=/path/to/keyfile.pem

# This creates: extension.crx
```

### Publishing to Chrome Web Store

1. Create developer account at chromewebstore.google.com
2. Pay $5 registration fee
3. Upload .zip of extension
4. Add screenshots and description
5. Submit for review (3-5 days)

## 🚀 Performance Optimization Tips

### Reduce DOM Queries

```javascript
// ❌ Bad: Multiple queries
const element1 = document.querySelector('.selector');
const element2 = document.querySelector('.selector');

// ✅ Good: Reuse result
const element1 = document.querySelector('.selector');
const element2 = element1;
```

### Debounce Event Listeners

```javascript
// For frequently firing events, debounce:
let timeout;
video.addEventListener('timeupdate', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    // Do work
  }, 500);
});
```

### Lazy Load Overlays

```javascript
// Only inject CSS when needed
if (!window.ytrStylesInjected) {
  injectStyles();
  window.ytrStylesInjected = true;
}
```

## 🔄 Maintenance

### Regular Updates Checklist

- [ ] Test against latest YouTube changes
- [ ] Update Manifest version in package.json
- [ ] Update version number in manifest.json
- [ ] Review browser compatibility
- [ ] Check for deprecated Chrome APIs
- [ ] Update documentation

### Common Breaking Changes

- YouTube layout changes → Requires DOM selector updates
- Chrome API changes → Manifest V4 eventually
- Storage API changes → May need migration script

## 📚 Additional Resources

- [Chrome Extensions Developer Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Manifest V3 Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Web APIs Reference](https://developer.mozilla.org/en-US/docs/Web/API)

---

**Happy developing! 🚀**
