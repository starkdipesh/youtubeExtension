# Channel Blocking Issues - Debugging Guide

## 🔍 How to Debug "Channel Not Permitted" Error

Follow these steps to diagnose and fix the issue:

### Step 1: Check Extension Configuration

1. Click the extension icon in Chrome
2. Verify:
   - Did you **select @Handle dropdown**?
   - Is your handle entered correctly without extra spaces?
   - Is the display name filled in?
3. Check that **Save** was successful (green success message appeared)

**Example:**
```
Input Type: @Handle ✓
Channel: tech-gamerz7292 ✓
Display Name: Tech Gamers ✓
```

### Step 2: Open Browser Console (Critical!)

This is where all debugging happens:

1. Go to YouTube page
2. Press **F12** to open DevTools
3. Click the **Console** tab
4. You'll see detailed logs starting with `[YTR]`

### Step 3: Check the Logs

Look for these messages in the console:

**✅ GOOD - Initialization successful:**
```
[YTR] ========== INITIALIZING ==========
[YTR] Storage data retrieved: {channelHandle: "tech-gamerz7292", channelName: "Tech Gamers"}
[YTR] ✅ Initialized with channel handle: Tech Gamers tech-gamerz7292
[YTR] ========== INIT COMPLETE ==========
```

**❌ BAD - No channel configured:**
```
[YTR] ⚠️ No channel configured
```
→ **FIX:** Go back to extension popup and save settings again.

### Step 4: Watch Video and Monitor Logs

Navigate to a YouTube video from your channel:

1. Play the video
2. Watch the console for these logs:

**Should see:**
```
[YTR] === blockUnauthorizedContent START ===
[YTR] Current config: {CHANNEL_ID: null, CHANNEL_HANDLE: "tech-gamerz7292", CHANNEL_NAME: "Tech Gamers"}
[YTR] Extraction attempt 1
[YTR] Found X channel links
[YTR] Processing link: https://www.youtube.com/@tech-gamerz7292
[YTR] Extracted handle from href: tech-gamerz7292
[YTR] Attempt 1 result: {channelId: null, channelHandle: "tech-gamerz7292", hasInfo: true}
[YTR] Successfully extracted: {channelHandle: "tech-gamerz7292"}
[YTR] Comparison: {isIdMatch: false, isHandleMatch: true, isAuthorized: true}
[YTR] ✅ VIDEO AUTHORIZED
```

**If you see this instead:**
```
[YTR] Comparison: {isIdMatch: false, isHandleMatch: false, isAuthorized: false}
[YTR] ❌ VIDEO BLOCKED - Not authorized
```

→ **PROBLEM:** The handles are not matching!

---

## 🚨 Common Issues and Fixes

### Issue 1: "But the handle looks correct!"

The problem is likely **whitespace or case sensitivity**. Check:

```javascript
// In console, type:
console.log('Configured handle:', 'tech-gamerz7292'.toLowerCase().trim());
```

**Common mistakes:**
- ❌ Entered: ` tech-gamerz7292 ` (has spaces)
- ✅ Should be: `tech-gamerz7292` (no spaces)

- ❌ Entered: `Tech-Gamers7292` (capital letters)
- ✅ Should be: `tech-gamerz7292` (lowercase)

- ❌ Entered: `@tech-gamerz7292` (has @ symbol)
- ✅ Should be: `tech-gamerz7292` (no @ symbol)

**FIX:** Go to extension popup, carefully re-enter handle, click Save.

### Issue 2: Channel link not found in page

If you see:
```
[YTR] Found 0 channel links
```

→ **WAIT:** The page might still be loading. Channels are embedded in the page dynamically.
→ **SOLUTION:** Reload the page (F5) and wait 2-3 seconds.

### Issue 3: Multiple channel links detected but none match

If you see:
```
[YTR] Found 5 channel links
[YTR] Processing link: https://www.youtube.com/
[YTR] Processing link: https://www.youtube.com/watch?v=...
[YTR] No channel link found
```

→ **PROBLEM:** The DOM selectors aren't finding the right links.

**FIX:** 
1. Right-click on the **channel name** next to the video title
2. Click "Inspect" (or Inspect Element)
3. Look for `href` attributes containing `/@` or `/channel/`
4. Share the HTML in the console for debugging

---

## 🧪 Testing Steps (Do This!)

### Test 1: Verify Your Channel Handle

1. Go to your YouTube channel
2. Copy the URL: `https://www.youtube.com/@YOUR-HANDLE`
3. Extract just the handle: `YOUR-HANDLE`
4. In extension, paste exactly this (no @ symbol, no spaces)
5. Save
6. Check console for `[YTR] ✅ Initialized with channel handle`

### Test 2: Watch Your Own Channel Video

1. Go to one of your videos
2. Open DevTools (F12)
3. Check console for:
   ```
   [YTR] ✅ VIDEO AUTHORIZED
   ```

**If NOT authorized:**
- Check the "Detected from page" logs
- Compare with your "Current config"
- Look for case/whitespace mismatches

### Test 3: Try a Different Channel's Video

1. Go to any OTHER creator's video
2. Should see:
   ```
   [YTR] ❌ VIDEO BLOCKED - Not authorized
   ```
- Wait 3 seconds → page redirects to your channel
- Overlay appears: "This channel is not allowed"

---

## 🔧 Advanced Debugging

### Enable Maximum Logging

Paste this in Console to get even more details:

```javascript
// Check what's stored
chrome.storage.sync.get((data) => {
  console.log('[DEBUG] All stored data:', data);
});

// Check current video page title
console.log('[DEBUG] Page title:', document.title);

// Find all channel links
const links = document.querySelectorAll('a[href*="/channel/"], a[href*="/@"]');
console.log('[DEBUG] All channel links:');
links.forEach((link, i) => {
  console.log(`  [${i}] ${link.href}`);
});
```

### Manual Channel Detection

Paste this in Console to manually extract the channel:

```javascript
const links = document.querySelectorAll('a[href*="/@"]');
for (let link of links) {
  const href = link.href;
  const match = href.match(/\/@([a-zA-Z0-9_.-]+)/);
  if (match) {
    console.log('Found handle:', match[1]);
  }
}
```

---

## 📋 Checklist Before Debugging

- [ ] Extension is loaded in `chrome://extensions/`
- [ ] Extension icon shows in toolbar
- [ ] Clicked extension and saw settings popup
- [ ] Entered channel handle/ID and clicked Save
- [ ] Got green "Settings saved!" message
- [ ] Reloaded YouTube tab (Ctrl+R or Cmd+R)
- [ ] Opened DevTools (F12) and clicked Console tab
- [ ] Refreshed page and watched console for `[YTR]` messages

---

## 🆘 Still Not Working?

**Do this:**

1. **Clear settings & restart:**
   - Extension icon → Click "Clear Settings"
   - Close DevTools
   - Reload YouTube page

2. **Re-enter handle carefully:**
   - Go to your channel: `https://www.youtube.com/@your-handle`
   - Copy `your-handle` part ONLY
   - Open extension
   - Select `@Handle` from dropdown
   - Paste handle (no @ symbol)
   - Enter display name
   - Click Save

3. **Reload and test:**
   - Open DevTools (F12 → Console)
   - Reload YouTube page
   - Watch for `[YTR]` messages
   - Navigate to your channel's video
   - Should see `✅ VIDEO AUTHORIZED`

4. **Share console logs:**
   If still broken, screenshot your console:
   - Note the exact error messages
   - Check what handle the extension found
   - Compare to what you configured

---

## 📞 Detailed Logs Reference

### Initialization Logs
- `[YTR] INITIALIZING` = Extension starting
- `[YTR] Initialized with channel handle` = Settings loaded successfully
- `[YTR] No channel configured` = No settings saved yet

### Video Detection Logs
- `[YTR] Extraction attempt N` = Trying to find channel info
- `[YTR] Found X channel links` = Found potential sources
- `[YTR] Processing link:` = Analyzing this link
- `[YTR] Extracted handle` = Successfully found the handle

### Comparison Logs
- `[YTR] Comparison:` = Shows matching logic
- `isIdMatch: true` = Channel ID matched
- `isHandleMatch: true` = Handle matched
- `isAuthorized: true/false` = Final result

### Action Logs
- `[YTR] ✅ VIDEO AUTHORIZED` = Video is allowed, playing
- `[YTR] ❌ VIDEO BLOCKED` = Unauthorized channel, redirecting
- `[YTR] Navigating to:` = Redirecting to your channel
- `[YTR] Clicking video link...` = Auto-playing next video

---

**Remember:** The console is your best friend! All logs start with `[YTR]` so they're easy to spot.

**Last Updated:** March 11, 2026
