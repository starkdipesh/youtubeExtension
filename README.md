# YouTube Channel Restrictor - Chrome Extension

A powerful Chrome Extension (Manifest V3) that restricts YouTube to a specific channel and automatically plays the next video from that channel.

## 📋 Features

### Core Functionality
- **Strict Channel Access Control**: Blocks all videos not from the allowed channel
- **Auto-Play Next Video**: Automatically plays the next video from your allowed channel when the current one ends
- **Smart Sidebar Scanning**: Scans the 'Up Next' sidebar to find videos from the allowed channel
- **Intelligent Fallback**: If no matching videos are in the sidebar, automatically redirects to the channel's latest uploads
- **SPA Compatibility**: Works seamlessly with YouTube's dynamic page loads using `yt-navigate-finish` event listeners
- **Non-Intrusive UI**: Clean, modern overlays show status during transitions

### User Experience
- 🎬 Beautiful settings popup with easy configuration
- ✅ Form validation for YouTube channel IDs
- 🧪 Built-in test button to verify your channel setup
- 💾 Persistent settings using Chrome's storage API
- 📱 Responsive design that works on all screen sizes

## 🚀 Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Clone or extract** this extension folder
2. Open **Chrome** (or Chromium-based browser)
3. Navigate to `chrome://extensions/`
4. Enable **Developer mode** (toggle in top-right corner)
5. Click **Load unpacked**
6. Select the extension folder
7. The extension will appear in your extensions list

### Method 2: Package and Distribute

```bash
# Create a .crx file for distribution
# Note: This requires Chrome web store account for proper distribution
```

## ⚙️ Configuration

### Initial Setup

1. Click the extension icon in your toolbar
2. Choose input type: **@Handle** (recommended) or **Channel ID**
3. Enter your YouTube handle or channel ID
4. Enter a **Display Name** for your channel
5. Click **Save Settings**
6. Reload any open YouTube tabs for changes to take effect

### Method 1: Using Channel Handle (Recommended)

The easiest way! Just use the `@handle` from your URL.

1. Go to your YouTube channel
2. Copy the handle from the URL: `https://www.youtube.com/@your-handle-here`
3. In the extension, select **"@Handle"** from the dropdown
4. Enter: `@your-handle-here` (or just `your-handle-here`)
5. Enter a display name
6. Save!

**Example:**
- **Channel Handle:** `@tech-gamerz7292`
- **Display Name:** `Tech Gamers`

### Method 2: Using Channel ID

If you prefer using the numeric Channel ID:

1. Go to your [YouTube Studio](https://studio.youtube.com)
2. Navigate to **Settings** → **Channel** → **Basic info**
3. Your Channel ID is displayed (format: `UC` + 22 characters)
4. In the extension, select **"Channel ID"** from the dropdown
5. Copy and paste your Channel ID
6. Enter a display name
7. Save!

**Example:**
- **Channel ID:** `UCddiUEpYJcSLOGAMZIQWUZA`
- **Display Name:** `Linus Tech Tips`

### Both Methods Work!

The extension automatically detects whether you're using:
- ✅ Custom handles (e.g., `@tech-gamerz7292`)
- ✅ Channel IDs (e.g., `UC1234567890abcdefghijk`)

## 📝 How It Works

### Video Playback Flow

```
[Video Starts]
     ↓
[Monitor Video Element]
     ↓
[Video Ends - 'ended' Event]
     ↓
[Scan 'Up Next' Sidebar]
     ↓
[Find First Video from Allowed Channel?]
     ├─ YES: Click and Play → Loop back to Video Starts
     └─ NO: Redirect to Channel Videos Page
```

### Content Script Operations

The `content.js` file handles:

1. **Channel Validation**
   - Extracts channel ID from current video
   - Blocks unauthorized channels
   - Shows blocking warning overlay

2. **Video Monitoring**
   - Watches for video element in DOM
   - Attaches 'ended' event listener
   - Monitors for video state changes

3. **Next Video Discovery**
   - Queries DOM for recommended videos
   - Extracts channel information from video links
   - Matches against allowed channel ID

4. **Navigation Handling**
   - Listens for `yt-navigate-finish` events (SPA)
   - Re-initializes monitoring for new videos
   - Cleans up previous event listeners

### Service Worker Operations

The `background.js` service worker:
- Handles extension installation
- Manages storage API calls
- Routes messages between popup and content script
- Provides extension lifecycle management

## 🎨 Visual Indicators

### Overlay Messages

| Message | Meaning |
|---------|---------|
| 🎬 Finding next video... | Scanning for next video |
| ✅ Playing next video... | Found matching video, playing |
| 📺 Playing latest from... | Redirecting to channel |
| ❌ This channel is not allowed! | Blocked - not your channel |
| ⚠️ Please set a YouTube channel | Extension not configured |

## 🔒 Privacy & Security

- **Local Storage Only**: All settings stored locally in Chrome's storage API
- **No Data Collection**: Extension doesn't collect or send user data
- **Channel ID Only**: Only requires your YouTube channel ID, no authentication needed
- **No Server Communication**: Everything runs client-side on your machine
- **Open Source**: Full transparency - review the source code

## 🛠️ Technical Details

### Technology Stack

- **Manifest V3**: Latest Chrome extension API standard
- **Vanilla JavaScript**: No external dependencies
- **Chrome Storage API**: Persistent local storage
- **DOM Manipulation**: Direct video control and navigation
- **Content Scripts**: YouTube page interaction

### Key Technologies Used

- `document.querySelector()` - DOM element selection
- `video.addEventListener('ended', ...)` - Video state monitoring
- `chrome.storage.sync` - Cross-device settings sync
- `MutationObserver` - Dynamic content detection
- `yt-navigate-finish` - YouTube SPA navigation events

### File Structure

```
youtubeExtension/
├── manifest.json          # Extension configuration
├── content.js             # YouTube page manipulation
├── background.js          # Service worker
├── popup.html             # Settings UI - HTML
├── popup.css              # Settings UI - Styles
├── popup.js               # Settings UI - Logic
├── icons/                 # Extension icons
│   ├── icon-16.svg       # 16x16 icon
│   ├── icon-48.svg       # 48x48 icon
│   └── icon-128.svg      # 128x128 icon
└── README.md              # This file
```

## 🔧 Customization

### Modifying the Overlay Style

Edit the CSS in `content.js` (`.ytr-overlay` class):

```javascript
.ytr-overlay {
  /* Customize colors, fonts, positioning, etc. */
  background: rgba(0, 0, 0, 0.95);
  color: white;
  /* ... */
}
```

### Adding More Allowed Channels

Modify `content.js` to support multiple channels:

```javascript
const ALLOWED_CHANNELS = ['UC1234567890', 'UC0987654321'];
if (ALLOWED_CHANNELS.includes(channelId)) { /* ... */ }
```

### Adjusting Auto-Play Delay

Change timeout values in:
- `playNextVideoFromChannel()`: `setTimeout(..., 1000)` → `setTimeout(..., 2000)`
- Video discovery delay: `await new Promise(resolve => setTimeout(resolve, 500))`

## ⚡ Performance Considerations

- **Minimal DOM Queries**: Uses efficient selectors
- **Event Delegation**: Single listener per video element
- **MutationObserver**: Monitors for lazy-loaded content
- **Memory Efficient**: Cleans up old listeners and overlays
- **No External Requests**: All logic runs locally

## 🐛 Troubleshooting

### Extension Not Working?

1. **Reload the extension**
   - Go to `chrome://extensions/`
   - Click the refresh icon

2. **Reload YouTube tab**
   - Close and reopen the YouTube tab
   - Or press `Ctrl+Shift+R` for hard refresh

3. **Check channel ID format**
   - Must start with `UC`
   - Must be exactly 24 characters
   - No spaces or special characters

### Videos Not Auto-Playing?

1. **Verify Up Next loaded**
   - Wait 2-3 seconds after video ends
   - Check if sidebar populated

2. **Check browser console**
   - Open DevTools: `F12`
   - Look for `[YTR]` tagged messages

3. **Clear and reset**
   - Use "Clear Settings" button
   - Re-enter channel ID correctly

### Overlay Not Showing?

1. **Check pop-ups not blocked**
   - Allow overlays in extension settings

2. **Verify JavaScript enabled**
   - Extensions require JavaScript

3. **Try different video**
   - Some videos may have different DOM structure

## 📚 Browser Compatibility

- ✅ **Chrome**: 88+
- ✅ **Edge**: 88+
- ✅ **Brave**: Latest
- ✅ **Vivaldi**: Latest
- ⚠️ **Firefox**: Requires porting to WebExtensions API
- ❌ **Safari**: Use their extension store

## 📄 License

This extension is provided as-is for personal use. Feel free to modify and distribute according to your needs.

## 💡 Tips & Tricks

### For Content Creators
- Keep your audience focused on your channel content
- Great for creating curated playlists with auto-continue
- Perfect for educational channels aimed at specific audiences

### For Parents
- Restrict kids' access to appropriate content creators
- Ensures continuous safe content consumption
- Simple setup requires no technical knowledge

### For Researchers
- Focus study material from trusted sources
- Eliminate recommendation rabbit holes
- Maintain productivity by limiting content variation

## 🚀 Future Enhancements

Potential features for future versions:
- [ ] Support for multiple allowed channels
- [ ] Whitelist/blacklist specific videos
- [ ] Custom overlay themes
- [ ] Watch time statistics
- [ ] Scheduled restrictions (e.g., after 1 hour)
- [ ] Sync settings across devices
- [ ] Dark/light theme toggle

## 🤝 Contributing

Found a bug or want to suggest a feature? 

1. Test thoroughly to confirm the issue
2. Document steps to reproduce
3. Share browser version and extension version
4. Include console logs if relevant

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review console logs (F12 → Console tab)
3. Verify channel ID format
4. Reload extension and YouTube tabs

## 🎓 Learning Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [JavaScript DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)

---

**Made with ❤️ for YouTubers and content enthusiasts**

Version 1.0.0 | Last Updated: March 2026
