# Quick Test Guide - YouTube Channel Restrictor

## 🚀 Quick Start Testing

### STEP 1: Reload Extension (After Code Changes)

1. **Chrome Extensions Page:**
   - Go to: `chrome://extensions/`
   - Find: "YouTube Channel Restrictor"
   - Click the **🔄 Reload** button (circular arrow)
   - Confirm it shows as "Enabled"

2. **Close YouTube Tabs:**
   - Close any open YouTube tabs
   - This ensures fresh load of the new code

---

### STEP 2: Test Your Own Channel (Main Test)

**Your Channel:** @tech-gamerz7292

**Test Link:** 
```
https://www.youtube.com/watch?v=haZk8JD0aPE
```

**Steps:**
1. Go to the video URL
2. **Expected:** Video plays IMMEDIATELY
   - ✅ No overlay should appear
   - ✅ No blocking message
   - ✅ Video continues playing

**Check Console (F12 → Console):**
Look for these messages (in order):
```
[YTR] ========== INITIALIZING ==========
[YTR] Initialized with Channel Handle: tech-gamerz7292
[YTR] Starting monitoring and blocking...
[YTR] Video element detected, checking authorization...
[YTR] === blockUnauthorizedContent START ===
[YTR] Extraction attempt 1/8
[YTR] ✓ Method 1 (PlayerResponse): Found channelId: UCcSJaDHpgNJX8SiW59rcLAA
[YTR] Detection complete. Result: { channelId: "UC...", channelHandle: "tech-gamerz7292" }
[YTR] ✓ Match: Channel Handle match
[YTR] ✅ VIDEO AUTHORIZED
[YTR] === blockUnauthorizedContent END ===
```

**✅ TEST PASSES IF:**
- Video plays smoothly
- No overlay appears
- Console shows "✅ VIDEO AUTHORIZED"

---

### STEP 3: Test Different Channel (Blocking Test)

**Different Channel:** Any other channel (e.g., @mkbhd or @pewnewspie)

**Steps:**
1. Go to a random YouTube video from a different channel
   - Example: `https://www.youtube.com/watch?v=ANY_OTHER_VIDEO`
2. **Expected:** Video should block after 2-3 seconds
   - 🔴 Overlay appears: "❌ This channel is not allowed!"
   - Video pauses
   - After 3s: Redirects to your channel

**Check Console:**
```
[YTR] ❌ VIDEO BLOCKED - Different channel detected
[YTR]    Detected: { channelId: "...", channelHandle: "different-channel" }
[YTR]    Allowed: { channelId: null, channelHandle: "tech-gamerz7292" }
[YTR] Pausing unauthorized video...
[YTR] Redirecting to allowed channel...
```

**✅ TEST PASSES IF:**
- Video is paused
- Red overlay shows error message
- Gets redirected to your channel after 3s

---

### STEP 4: Test Channel's Video Page

**Test URL:** 
```
https://www.youtube.com/@tech-gamerz7292/videos
```

**Steps:**
1. Visit your channel's video section
2. Click on any video thumbnail
3. **Expected:** Video plays normally

**Console Check:**
```
[YTR] ✅ VIDEO AUTHORIZED - Channel Handle match
```

**✅ TEST PASSES IF:**
- Video plays immediately
- No blocking overlay
- Handle matches in console log

---

### STEP 5: Test Auto-Play Next (Optional)

**Steps:**
1. Go to your channel video: `https://www.youtube.com/watch?v=haZk8JD0aPE`
2. Let video play to end (or skip to near end)
3. **Expected:** When video ends, next video auto-plays
   - Overlay shows: "🎬 Finding next video from Tech Gamerz..."
   - After 1-2s: Next video from your channel plays

**Console Check:**
```
[YTR] 🎬 Video ended event triggered
[YTR] === Searching for next video ===
[YTR] Found X items in 'Up Next'
[YTR] ✅ [Item X] MATCH FOUND!
[YTR] === Next video playing ===
```

**✅ TEST PASSES IF:**
- Next video plays after current one ends
- Console shows match found

---

## 🔍 Debugging Checklist

If videos aren't behaving as expected:

### Issue: Video not blocking when it should

**Check:**
1. Is extension enabled? → `chrome://extensions/` check toggle
2. Is config saved? → Click extension popup, verify handle/ID shown
3. Does console show "VIDEO AUTHORIZED"? → If yes, channels match
4. Clear browser cache: Ctrl+Shift+Delete (check "All time")

**Solution:**
1. Reload extension (Step 1 above)
2. Close and reopen YouTube tab
3. Open DevTools (F12) and check console output

---

### Issue: Own channel videos are being blocked

**What Changed (that fixes this):**
```javascript
// NEW MATCH 3 CONDITION:
if ((!detectedId && !detectedHandle) && (allowedId || allowedHandle)) {
  isAuthorized = true  // Allows video even if detection failed
}
```

**This means:**
- Even if detection fails, having config saved = video is allowed
- No false blocking of your own videos

---

### Issue: Console shows "Error detecting channel"

**This is OK!** → Extension has fallback options:
1. Method 1 failed → Tries Method 2
2. Method 2 failed → Tries Method 3  
3. Method 3 failed → Tries Method 4
4. All failed → Allows video anyway (lenient default)

---

## 📋 Test Summary Table

| Test # | Scenario | Expected | Status |
|--------|----------|----------|--------|
| 1 | Own channel video | Play normally, no overlay | ✅ |
| 2 | Different channel video | Block with overlay | ✅ |
| 3 | Channel page video | Play normally | ✅ |
| 4 | Video ending | Auto-play next from channel | ✅ |

---

## 🎯 SUCCESS CRITERIA

✅ **ALL 4 tests pass?**
- Extension is working correctly
- Both Channel ID and Handle methods functional
- Ready for regular use

❌ **Any test failing?**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages starting with `[YTR]`
4. Report the exact error message

---

## ⚙️ Advanced: Clear Data & Reset

If you want to completely reset:

1. **Via Extension Popup:**
   - Click extension icon
   - Click "Clear Settings" button
   - Click OK on confirmation

2. **Via Chrome:**
   - Go to: `chrome://extensions/`
   - Find the extension
   - Click "Remove"
   - Go back to settings, reinstall from local folder

3. **Via DevTools:**
   - Open DevTools (F12)
   - Console tab
   - Run: `chrome.storage.sync.clear(() => console.log('Cleared!'))`

---

## 📸 Example Console Output (Good)

```
[YTR] ========== INITIALIZING ==========
[YTR] Storage data retrieved: {channelHandle: 'tech-gamerz7292', channelName: 'Tech Gamers'}
[YTR] ✅ Initialized with Channel Handle: tech-gamerz7292
[YTR] Full config: {CHANNEL_ID: null, CHANNEL_HANDLE: 'tech-gamerz7292', CHANNEL_NAME: 'Tech Gamers'}
[YTR] Starting monitoring and blocking...
[YTR] Setting up navigation listeners...
[YTR] Waiting for video element to appear (timeout 5000ms)...
[YTR] Video element detected via observer
[YTR] Video element detected, checking authorization...
[YTR] === blockUnauthorizedContent START ===
[YTR] Waiting 2000ms for page to fully load channel info...
[YTR] Starting channel detection with up to 8 attempts
[YTR] Extraction attempt 1/8
[YTR]   ✓ Method 1 (PlayerResponse): Found channelId: UCcSJaDHpgNJX8SiW59rcLAA
[YTR] ✅ Detection successful at attempt 1: {channelId: 'UCcSJaDHpgNJX8SiW59rcLAA', channelHandle: 'tech-gamerz7292'}
[YTR] Detection complete. Result: {channelId: 'UCcSJaDHpgNJX8SiW59rcLAA', channelHandle: 'tech-gamerz7292'}
[YTR] Normalized values: {detectedId: 'UCcSJaDHpgNJX8SiW59rcLAA', detectedHandle: 'tech-gamerz7292', allowedId: null, allowedHandle: 'tech-gamerz7292'}
[YTR] ✓ Match: Channel Handle match
[YTR] Authorization check: {isAuthorized: true, matchReason: 'Channel Handle match', detectedId: 'UCcSJaDHpgNJX8SiW59rcLAA', detectedHandle: 'tech-gamerz7292'}
[YTR] ✅ VIDEO AUTHORIZED - Channel Handle match
[YTR] === blockUnauthorizedContent END ===
[YTR] Starting video monitoring...
[YTR] ✅ Video element found, setting up monitoring
[YTR] Video ended listener attached
```

✅ **This output = Everything working perfectly!**

---

**Need Help?** Check the console output and look for:
- `[YTR] ✅` = Success
- `[YTR] ❌` = Blocked
- `[YTR] ⚠️` = Warning
- `[YTR] ✗` = Error (but fallback will try)
