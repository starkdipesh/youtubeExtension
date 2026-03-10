# FAQ - YouTube Channel Restrictor

## Common Questions & Answers

### 🚀 Installation & Setup

**Q: How do I install the extension?**
A: 
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select the extension folder
5. Done!

**Q: Where do I find my Channel ID?**
A: Go to [YouTube Studio](https://studio.youtube.com) → Settings → Channel → Basic info. Your Channel ID starts with "UC" followed by 22 characters.

**Q: Can I use a custom URL (like @username) instead of Channel ID?**
A: Not directly, but YouTube provides Channel ID in YouTube Studio. The extension requires the numeric Channel ID (UC...) for reliability.

**Q: Do I need to install anything else?**
A: Just Chrome browser (version 88+). No additional software needed. The icon generator script requires Python 3 (optional).

---

### 📱 Usage & Features

**Q: What does "Strict Access" mean?**
A: Only videos from your configured channel can be watched. Clicking any other creator's video will block it and redirect you back to your channel.

**Q: Will it actually play the next video automatically?**
A: Yes! When a video ends, it scans YouTube's "Up Next" sidebar, finds the first video from your allowed channel, and clicks it to start playing.

**Q: What if there are no matching videos in the "Up Next" list?**
A: The extension redirects you to your channel's videos page (youtube.com/channel/[YOUR_ID]/videos) and plays the latest upload.

**Q: Does this work with YouTube Shorts?**
A: The current version is optimized for regular YouTube videos. Shorts have a different interface structure. Future updates may add Shorts support.

**Q: Can I watch playlists?**
A: Only playlists containing videos from your allowed channel will work. Videos from other creators in mixed playlists will be blocked.

**Q: Does it block search results?**
A: The extension monitors individual videos you click. Searching returns results from all channels, but videos from unauthorized creators will be blocked when clicked.

**Q: Can I configure multiple channels?**
A: Currently no, but this is a planned feature. For now, you can only restrict to one channel at a time.

---

### ⚙️ Technical Questions

**Q: Why use Manifest V3 instead of V2?**
A: Manifest V3 is the current Chrome Extension API standard. V2 is deprecated and will be removed. V3 is more secure and performant.

**Q: Does the extension collect any data?**
A: No. Everything runs locally on your machine. No data is sent to servers. Channel ID is only stored on your device.

**Q: Is my channel ID stored securely?**
A: Yes. Stored in Chrome's `storage.sync` API which is encrypted. You can clear it anytime using the "Clear Settings" button.

**Q: What happens to my settings if I uninstall?**
A: All settings are erased. If you reinstall, you'll need to configure again.

**Q: Can I sync settings across devices?**
A: Yes! Chrome's `storage.sync` syncs settings if you're logged into the same Google account on multiple devices.

**Q: How does the extension detect the video's channel?**
A: It extracts the channel ID from the video page's HTML elements, particularly channel links next to the video title.

**Q: What if YouTube changes their page structure?**
A: The extension uses multiple fallback methods to find channel information. If all fail, channel validation won't work for that session. Users can reload the page to retry.

---

### 🐛 Troubleshooting

**Q: The extension doesn't work. What should I do?**
A: 
1. Check that Channel ID is correct (starts with UC, 24 characters total)
2. Reload the YouTube tab (Ctrl+Shift+R or Cmd+Shift+R)
3. Open DevTools (F12) and check Console for error messages
4. Look for logs starting with `[YTR]`

**Q: Auto-play isn't working?**
A:
- Ensure "Up Next" sidebar is visible
- Wait 2-3 seconds after video ends (YouTube loads recommendations dynamically)
- Check if "Up Next" has videos from your channel
- Try manually clicking a video from your channel - should play fine

**Q: The overlay says "Permission denied" or similar?**
A: 
- The extension might not have content script injected
- Reload the YouTube tab
- Check that the extension is enabled in `chrome://extensions/`
- Try disabling and re-enabling the extension

**Q: Settings aren't saving?**
A:
- Ensure you're not in private/incognito mode
- Try closing the popup and clicking again
- Close all YouTube tabs and reload one

**Q: It blocks my own channel's videos?**
A: Channel ID must match exactly. Go to YouTube Studio and copy the Channel ID again (make sure no spaces). Clear extension settings and re-enter the ID.

**Q: Why is there a huge delay before auto-play?**
A: YouTube loads recommendations dynamically. The extension waits for them to appear. If delay is excessive:
- Check your internet speed
- Verify "Up Next" loads in sidebar
- Try a different video

---

### 🔧 Advanced Topics

**Q: Can I modify the extension?**
A: Yes! The code is yours to customize. See [DEVELOPMENT.md](DEVELOPMENT.md) for technical details.

**Q: How do I change the overlay appearance?**
A: Edit the `.ytr-overlay` CSS in `content.js`. You can modify colors, fonts, animations, position, etc.

**Q: How do I support multiple channels?**
A: See [DEVELOPMENT.md](DEVELOPMENT.md) for code modification examples. You'd change the `ALLOWED_CHANNELS` array to accept multiple IDs.

**Q: Can I add whitelist/blacklist features?**
A: Yes! The extension can be extended to support blocking specific videos or whitelisting channels. Check DEVELOPMENT.md for architectural guidance.

**Q: How do I debug why a video isn't being blocked?**
A: 
1. Open DevTools (F12)
2. Go to Console tab
3. Look for `[YTR]` messages
4. Check if current video's channel ID matches
5. Look for errors in red

**Q: Can I monitor watch time or set limits?**
A: Not in the current version, but the architecture supports adding this. You'd modify `content.js` to track `<video>` element's `currentTime`.

---

### 💡 Pro Tips

**Q: How can I use this for parental control?**
A: Configure it with an educational channel. Children can watch only that channel - great for learning while preventing unwanted content exposure.

**Q: Can I use this for productivity?**
A: Yes! Restrict yourself to educational channels (TED, Khan Academy, etc.). Eliminates recommendation rabbit holes.

**Q: What's the difference between this and YouTube's restricted mode?**
A: 
- Restricted Mode: Blocks mature content generally
- This Extension: Restricts to ONE specific channel completely
- This Extension is more strict but channel-specific

**Q: Can I use this with multiple browser profiles?**
A: Yes! Each profile can have different settings. Configure them separately.

**Q: Does this work with playlist focus mode?**
A: The extension monitors individual videos, so playlist mode works but with auto-next. You might need to disable auto-play in extension or use YouTube's native playlist features.

---

### 🎓 Learning Resources

**Q: Where can I learn Chrome Extension development?**
A: Check [DEVELOPMENT.md](DEVELOPMENT.md) and official [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/)

**Q: How do I report a bug?**
A: Note the exact steps to reproduce, your Channel ID format, browser version, and console error messages.

**Q: Can I contribute to improve this extension?**
A: The code is open for modification. You're welcome to create improved versions!

---

### 📞 Still Need Help?

1. **Reread QUICKSTART.md** - It covers most common issues
2. **Check DEVELOPMENT.md** - Has debugging techniques
3. **Review console logs** - Press F12 on YouTube and check Console
4. **Reload everything** - Close popup, reload YouTube tab, try again
5. **Clear and restart** - Use "Clear Settings", unload/load extension

---

**Version 1.0.0**  
**Last Updated: March 2026**

*Have a question not covered here? Check the source code - it's well-commented!*
