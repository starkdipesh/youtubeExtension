# Quick Start Guide

Get your YouTube Channel Restrictor extension up and running in 5 minutes!

## ⚡ 30-Second Setup

1. **Find your Channel ID**
   - Visit [YouTube Studio](https://studio.youtube.com)
   - Go to Settings → Channel → Basic info
   - Copy your Channel ID (starts with "UC")

2. **Load the Extension**
   - Open Chrome to `chrome://extensions/`
   - Toggle ON "Developer mode" (top-right)
   - Click "Load unpacked"
   - Select the `youtubeExtension` folder

3. **Configure**
   - Click the extension icon in your toolbar
   - Paste Channel ID
   - Enter Channel Name
   - Click Save

4. **Done!** 🎉
   - Reload any YouTube tabs
   - You're now restricted to your channel!

## 🎬 First Use

### Test Setup
1. Click extension icon → "Test (Open Channel)"
2. Should open your channel in a new tab
3. Watch a video, let it end
4. Next video from your channel should play automatically

### Try Blocking
1. Open a YouTube video from a different creator
2. Should see warning overlay
3. Redirects to your channel automatically

## 📱 Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension doesn't find next video | Wait 2-3 seconds, YouTube may not have loaded recommendations |
| Video not blocking | Check Channel ID format (must start with "UC" and be 24 chars) |
| Settings not saving | Close and reopen popup, try again |
| Overlay not showing | Hard refresh YouTube page (Ctrl+Shift+R) |
| No auto-play | Check that "Up Next" sidebar is visible |

## 🎓 Pro Tips

- Use "Clear Settings" if you want to completely reset
- Extension works best when Up Next sidebar is visible
- Reload YouTube tabs after changing settings
- Check your channel ID exactly - no spaces!

## 📖 Next Steps

- Read [README.md](README.md) for full features and customization
- Check [DEVELOPMENT.md](DEVELOPMENT.md) if you want to modify code
- View console logs (F12) for debugging information

## ❓ Still Have Questions?

1. **Extension not recognizing videos?**
   - Open DevTools (F12 → Console)
   - Look for `[YTR]` messages
   - They'll tell you what's happening

2. **Want to customize appearance?**
   - Edit `.ytr-overlay` CSS in `content.js`
   - Change colors, fonts, animations

3. **Want to restrict multiple channels?**
   - See DEVELOPMENT.md for modification guide
   - Could support whitelist/blacklist lists

---

**You're all set! Enjoy focused YouTube watching! 🎥**
