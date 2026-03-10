/**
 * YouTube Channel Restrictor - Content Script
 * Handles video monitoring, auto-play next video, and UI overlays
 */

let CHANNEL_ID = null;
let CHANNEL_HANDLE = null;  // For @handle format
let CHANNEL_NAME = null;
let currentVideoChannelId = null;
let currentVideoChannelHandle = null;
let isProcessing = false;
let videoObserver = null;

// Wait for video element to appear (with timeout)
function waitForVideoElement(timeoutMs = 5000) {
  return new Promise((resolve) => {
    // Check if already exists
    if (document.querySelector('video')) {
      console.log('[YTR] Video element already present');
      resolve(true);
      return;
    }
    
    // Wait for it to appear using MutationObserver
    const observer = new MutationObserver(() => {
      if (document.querySelector('video')) {
        console.log('[YTR] Video element detected via observer');
        observer.disconnect();
        resolve(true);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    // Timeout fallback
    setTimeout(() => {
      console.log('[YTR] Timeout waiting for video element after ' + timeoutMs + 'ms');
      observer.disconnect();
      resolve(false);
    }, timeoutMs);
  });
}

// Initialize the extension
function init() {
  console.log('[YTR] ========== INITIALIZING ==========');
  
  chrome.storage.sync.get(['channelId', 'channelHandle', 'channelName'], async (data) => {
    console.log('[YTR] Storage data retrieved:', data);
    
    // Support both old format (channelId) and new format (channelHandle)
    if (data.channelId) {
      CHANNEL_ID = data.channelId;
      CHANNEL_NAME = data.channelName || 'Allowed Channel';
      console.log('[YTR] ✅ Initialized with Channel ID:', CHANNEL_ID);
      console.log('[YTR] Channel Name:', CHANNEL_NAME);
    } else if (data.channelHandle) {
      CHANNEL_HANDLE = data.channelHandle;
      CHANNEL_NAME = data.channelName || data.channelHandle;
      console.log('[YTR] ✅ Initialized with Channel Handle:', CHANNEL_HANDLE);
      console.log('[YTR] Channel Name:', CHANNEL_NAME);
    }
    
    console.log('[YTR] Full config:', { CHANNEL_ID, CHANNEL_HANDLE, CHANNEL_NAME });
    
    if (CHANNEL_ID || CHANNEL_HANDLE) {
      console.log('[YTR] Starting monitoring and blocking...');
      
      // Step 1: Setup video monitoring immediately
      monitorCurrentVideo();
      
      // Step 2: Setup navigation listeners
      listenForNavigation();
      
      // Step 3: CRITICAL - Wait for video element to actually appear
      // Don't just wait a fixed time - wait for the DOM element
      console.log('[YTR] Waiting for video element to appear (timeout 5000ms)...');
      const videoFound = await waitForVideoElement(5000);
      
      // Step 4: Do blocking check ONLY if video element exists
      if (videoFound) {
        console.log('[YTR] Video element detected, checking authorization...');
        await blockUnauthorizedContent();
      } else {
        console.log('[YTR] Video element did not appear during init - will check on navigation');
      }
    } else {
      console.log('[YTR] ⚠️ No channel configured');
      showOverlay('⚠️ Please set a YouTube channel in the extension settings');
    }
    
    console.log('[YTR] ========== INIT COMPLETE ==========');
  });
}

/**
 * Display overlay on the page
 */
function showOverlay(message, duration = 0) {
  removeOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'ytr-overlay';
  overlay.className = 'ytr-overlay';
  overlay.textContent = message;
  
  document.body.appendChild(overlay);
  
  if (duration > 0) {
    setTimeout(() => {
      removeOverlay();
    }, duration);
  }
}

/**
 * Remove the overlay
 */
function removeOverlay() {
  const overlay = document.getElementById('ytr-overlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Inject CSS for the overlay
 */
function injectStyles() {
  if (document.getElementById('ytr-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'ytr-styles';
  style.textContent = `
    .ytr-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 30px 40px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 500;
      z-index: 99999;
      text-align: center;
      font-family: 'Roboto', 'Arial', sans-serif;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
      animation: ytr-fade-in 0.3s ease-in-out;
    }

    @keyframes ytr-fade-in {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    .ytr-blocked-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
      color: white;
      padding: 15px 20px;
      font-size: 16px;
      font-weight: 600;
      z-index: 99998;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }

    .ytr-check-icon {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>') center/contain no-repeat;
    }

    #playnext-button {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 15px;
      transition: all 0.3s ease;
    }

    #playnext-button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Get the channel ID and handle from the current video
 */
async function getCurrentVideoChannelInfo() {
  return new Promise((resolve) => {
    let channelId = null;
    let channelHandle = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 8;

    console.log('[YTR] Starting channel detection with up to ' + MAX_ATTEMPTS + ' attempts');

    // Function to attempt extraction
    const tryExtract = () => {
      attempts++;
      console.log(`[YTR] Extraction attempt ${attempts}/${MAX_ATTEMPTS}`);

      // ⭐ METHOD 1: From ytInitialPlayerResponse (MOST RELIABLE for Channel ID)
      try {
        if (window.ytInitialPlayerResponse && window.ytInitialPlayerResponse.videoDetails) {
          const vd = window.ytInitialPlayerResponse.videoDetails;
          channelId = vd.channelId;
          console.log('[YTR]   ✓ Method 1 (PlayerResponse): Found channelId:', channelId);
          
          // Try to get channel name from here too
          if (vd.author) {
            console.log('[YTR]   ✓ Method 1 (PlayerResponse): Found author:', vd.author);
          }
        }
      } catch (e) {
        console.log('[YTR]   ✗ Method 1 (PlayerResponse) failed:', e.message);
      }

      // ⭐ METHOD 2: From ytInitialData JSON (helps find handle and channel name)
      try {
        const scripts = document.querySelectorAll('script');
        for (let script of scripts) {
          const content = script.textContent;
          if (!content || content.length > 500000) continue;
          
          let data = null;
          
          // Try to find and parse ytInitialData
          const jsonMatch1 = content.match(/var ytInitialData = ({.*?});/);
          const jsonMatch2 = content.match(/ytInitialData = ({.*?});/);
          const jsonMatch = jsonMatch1 || jsonMatch2;
          
          if (jsonMatch) {
            try {
              data = JSON.parse(jsonMatch[1]);
              const headerText = JSON.stringify(data);
              
              // Look for channel ID in JSON
              const channelIdMatch = headerText.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
              if (channelIdMatch && !channelId) {
                channelId = channelIdMatch[1];
                console.log('[YTR]   ✓ Method 2a (ytInitialData): Found channelId:', channelId);
              }
              
              // Look for handle (customUrl)
              const handleMatch = headerText.match(/"customUrl":"@?([a-zA-Z0-9_.-]+)"/);
              if (handleMatch && !channelHandle) {
                const rawHandle = handleMatch[1];
                channelHandle = rawHandle.replace(/^@/, '');
                console.log('[YTR]   ✓ Method 2b (ytInitialData): Found handle:', channelHandle);
              }
            } catch (parseErr) {
              // console.log('[YTR]   Parse error in script:', parseErr.message);
            }
          }
          
          // If found both, no need to continue
          if (channelId && channelHandle) break;
        }
      } catch (e) {
        console.log('[YTR]   ✗ Method 2 (ytInitialData) failed:', e.message);
      }

      // ⭐ METHOD 3: From visible channel links in DOM
      if (!channelId || !channelHandle) {
        try {
          // Find channel link near header - these are most reliable
          const channelLinks = document.querySelectorAll('a[href*="/channel/"], a[href*="/@"]');
          
          for (let link of channelLinks) {
            const href = link.getAttribute('href');
            if (!href) continue;
            
            // Extract Channel ID
            const channelMatch = href.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
            if (channelMatch && !channelId) {
              channelId = channelMatch[1];
              console.log('[YTR]   ✓ Method 3a (Links): Found channelId:', channelId);
            }
            
            // Extract Handle
            const handleMatch = href.match(/\/@([a-zA-Z0-9_.-]+)/);
            if (handleMatch && !channelHandle) {
              channelHandle = handleMatch[1];
              console.log('[YTR]   ✓ Method 3b (Links): Found handle:', channelHandle);
            }
            
            if (channelId && channelHandle) break;
          }
        } catch (e) {
          console.log('[YTR]   ✗ Method 3 (Links) failed:', e.message);
        }
      }

      // ⭐ METHOD 4: From page URL (if on channel page)
      if (!channelHandle) {
        try {
          const urlMatch = window.location.href.match(/\/@([a-zA-Z0-9_.-]+)/);
          if (urlMatch) {
            channelHandle = urlMatch[1];
            console.log('[YTR]   ✓ Method 4 (URL): Found handle:', channelHandle);
          }
        } catch (e) {
          console.log('[YTR]   ✗ Method 4 (URL) failed:', e.message);
        }
      }

      // ⭐ RESULT CHECK
      const hasInfo = channelId || channelHandle;
      
      if (hasInfo) {
        console.log('[YTR] ✅ Detection successful at attempt ' + attempts + ':', { channelId, channelHandle });
        resolve({ channelId, channelHandle });
        return;
      }
      
      // RETRY LOGIC
      if (attempts < MAX_ATTEMPTS) {
        const nextDelay = 500;
        console.log('[YTR] ⏳ Retrying in ' + nextDelay + 'ms... (Attempt ' + attempts + '/' + MAX_ATTEMPTS + ')');
        setTimeout(tryExtract, nextDelay);
      } else {
        console.log('[YTR] ❌ Failed to extract channel info after ' + MAX_ATTEMPTS + ' attempts');
        console.log('[YTR] Last attempt values:', { channelId, channelHandle });
        resolve({ channelId, channelHandle });
      }
    };

    // Start extraction
    tryExtract();
  });
}

/**
 * Block unauthorized videos
 */
async function blockUnauthorizedContent() {
  console.log('[YTR] === blockUnauthorizedContent START ===');
  console.log('[YTR] Looking for config:', { CHANNEL_ID, CHANNEL_HANDLE, CHANNEL_NAME });
  
  // Give page time to load channel info
  console.log('[YTR] Waiting 2000ms for page to fully load channel info...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const { channelId, channelHandle } = await getCurrentVideoChannelInfo();
  
  console.log('[YTR] Detection complete. Result:', { channelId, channelHandle });
  
  // Normalize for comparison
  const normalizeHandle = (h) => h ? h.toLowerCase().trim() : null;
  const detectedId = channelId;
  const detectedHandle = normalizeHandle(channelHandle);
  const allowedId = CHANNEL_ID;
  const allowedHandle = normalizeHandle(CHANNEL_HANDLE);
  
  console.log('[YTR] Normalized values:', { 
    detectedId,
    detectedHandle,
    allowedId,
    allowedHandle
  });
  
  // Check if authorized
  let isAuthorized = false;
  let matchReason = '';
  
  // ✓ MATCH 1: Channel ID matches (most reliable)
  if (allowedId && detectedId && detectedId === allowedId) {
    isAuthorized = true;
    matchReason = 'Channel ID match';
    console.log('[YTR] ✓ Match: ' + matchReason);
  }
  // ✓ MATCH 2: Channel Handle matches
  else if (allowedHandle && detectedHandle && detectedHandle === allowedHandle) {
    isAuthorized = true;
    matchReason = 'Channel Handle match';
    console.log('[YTR] ✓ Match: ' + matchReason);
  }
  // ✓ MATCH 3: No detection but we have at least one method working
  // If detection failed but we have config, be lenient
  else if ((!detectedId && !detectedHandle) && (allowedId || allowedHandle)) {
    console.log('[YTR] ⚠️ Warning: Channel detection failed, but config exists. Allowing video.');
    console.log('[YTR]    This might be the user\'s own channel - allowing playback.');
    isAuthorized = true;
    matchReason = 'Detection failed but allowing (config exists)';
  }
  
  console.log('[YTR] Authorization check:', { 
    isAuthorized, 
    matchReason,
    detectedId,
    detectedHandle
  });
  
  if (!isAuthorized && detectedId && detectedHandle) {
    // CONFIRMED UNAUTHORIZED - Different channel detected
    console.log('[YTR] ❌ VIDEO BLOCKED - Different channel detected');
    console.log('[YTR]    Detected:', { detectedId, detectedHandle });
    console.log('[YTR]    Allowed:', { allowedId, allowedHandle });
    
    currentVideoChannelId = detectedId;
    currentVideoChannelHandle = detectedHandle;
    
    showOverlay(
      `❌ This channel is not allowed!\n\nOnly "${CHANNEL_NAME}" is permitted.`,
      3000
    );
    
    // Pause video if it's playing
    const video = document.querySelector('video');
    if (video) {
      console.log('[YTR] Pausing unauthorized video...');
      video.pause();
    }
    
    // Redirect to allowed channel after 2 seconds
    setTimeout(() => {
      console.log('[YTR] Redirecting to allowed channel...');
      if (allowedId) {
        console.log('[YTR] Using Channel ID redirect:', allowedId);
        window.location.href = `https://www.youtube.com/channel/${allowedId}/videos`;
      } else if (allowedHandle) {
        console.log('[YTR] Using Handle redirect:', allowedHandle);
        window.location.href = `https://www.youtube.com/@${allowedHandle}`;
      }
    }, 3000);
  } else if (isAuthorized) {
    // AUTHORIZED - Update state and allow video
    console.log('[YTR] ✅ VIDEO AUTHORIZED - ' + matchReason);
    if (detectedId) currentVideoChannelId = detectedId;
    if (detectedHandle) currentVideoChannelHandle = detectedHandle;
  }
  
  console.log('[YTR] === blockUnauthorizedContent END ===');
}

/**
 * Monitor video element for the 'ended' event
 */
function monitorCurrentVideo() {
  console.log('[YTR] Starting video monitoring...');
  injectStyles();
  
  // Watch for video element
  const checkForVideo = setInterval(() => {
    const video = document.querySelector('video');
    
    if (video && !video.dataset.ytrMonitored) {
      console.log('[YTR] ✅ Video element found, setting up monitoring');
      
      video.dataset.ytrMonitored = 'true';
      
      /**
       * Handle video ended event
       */
      const handleVideoEnded = async () => {
        console.log('[YTR] 🎬 Video ended event triggered');
        if (isProcessing) {
          console.log('[YTR] Already processing, skipping...');
          return;
        }
        
        isProcessing = true;
        showOverlay(`🎬 Finding next video from ${CHANNEL_NAME}...`);
        
        // Give YouTube time to populate 'Up Next'
        console.log('[YTR] Waiting for recommendations to load...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const nextVideoFound = await playNextVideoFromChannel();
        
        if (!nextVideoFound) {
          console.log('[YTR] No next video found, using fallback');
          await fallbackToChannel();
        } else {
          console.log('[YTR] Next video playing successfully');
        }
        
        isProcessing = false;
      };

      video.addEventListener('ended', handleVideoEnded, { once: false });
      console.log('[YTR] Video ended listener attached');
      
      clearInterval(checkForVideo);
    }
  }, 500);

  // Clear interval after 30 seconds (video should be found by then)
  setTimeout(() => {
    clearInterval(checkForVideo);
    console.log('[YTR] Video detection timeout reached');
  }, 30000);
}

/**
 * Find and play the next video from the allowed channel
 */
async function playNextVideoFromChannel() {
  console.log('[YTR] === Searching for next video ===');
  const upNextItems = document.querySelectorAll('ytd-compact-video-renderer, ytd-video-renderer');
  
  console.log(`[YTR] Found ${upNextItems.length} items in 'Up Next'`);
  console.log('[YTR] Looking for:', { CHANNEL_ID, CHANNEL_HANDLE });
  
  let itemsChecked = 0;
  
  for (const item of upNextItems) {
    itemsChecked++;
    const channelLink = item.querySelector('a[href*="/channel/"], a[href*="/@"]');
    
    if (channelLink) {
      const href = channelLink.getAttribute('href');
      console.log(`[YTR] [Item ${itemsChecked}] Checking link:`, href);
      
      // Extract channel ID and handle from href
      let itemChannelId = null;
      let itemChannelHandle = null;
      
      const channelMatch = href.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      const customMatch = href.match(/\/@([a-zA-Z0-9_.-]+)/);
      
      if (channelMatch) {
        itemChannelId = channelMatch[1];
        console.log(`[YTR] [Item ${itemsChecked}] Found ID:`, itemChannelId);
      } 
      if (customMatch) {
        itemChannelHandle = customMatch[1];
        console.log(`[YTR] [Item ${itemsChecked}] Found handle:`, itemChannelHandle);
      }
      
      // Normalize for comparison
      const normalizeHandle = (h) => h ? h.toLowerCase().trim() : null;
      const itemHandle = normalizeHandle(itemChannelHandle);
      const allowedHandle = normalizeHandle(CHANNEL_HANDLE);
      
      // Check if this video's channel matches
      const isIdMatch = CHANNEL_ID && itemChannelId === CHANNEL_ID;
      const isHandleMatch = allowedHandle && itemHandle === allowedHandle;
      const isMatch = isIdMatch || isHandleMatch;
      
      console.log(`[YTR] [Item ${itemsChecked}] Comparison:`, { isIdMatch, isHandleMatch, isMatch, itemChannelId, CHANNEL_ID });
      
      if (isMatch) {
        console.log(`[YTR] ✅ [Item ${itemsChecked}] MATCH FOUND!`);
        
        // Find and click the video link
        const videoLink = item.querySelector('a#video-title, a[href*="/watch"]');
        if (videoLink) {
          console.log('[YTR] Clicking video link...');
          makeElementClickable(videoLink);
          videoLink.click();
          showOverlay(`▶️ Playing next video from ${CHANNEL_NAME}...`, 2000);
          console.log('[YTR] === Next video playing ===');
          return true;
        } else {
          console.log('[YTR] ❌ Could not find video link in matching item');
        }
      }
    } else {
      // console.log('[YTR] No channel link in this item');
    }
  }
  
  console.log(`[YTR] ❌ === No matching video found (checked ${itemsChecked} items) ===`);
  return false;
}

/**
 * Fallback: Redirect to channel and play latest video
 */
async function fallbackToChannel() {
  console.log('[YTR] === Fallback: No matching videos, redirecting ===');
  showOverlay(`📺 Playing latest from ${CHANNEL_NAME}...`, 2000);
  
  // Build the channel URL
  let channelUrl = '';
  if (CHANNEL_ID) {
    channelUrl = `https://www.youtube.com/channel/${CHANNEL_ID}/videos`;
    console.log('[YTR] Redirecting to channel ID:', channelUrl);
  } else if (CHANNEL_HANDLE) {
    channelUrl = `https://www.youtube.com/@${CHANNEL_HANDLE}`;
    console.log('[YTR] Redirecting to channel handle:', channelUrl);
  }
  
  if (!channelUrl) {
    console.log('[YTR] ❌ No channel URL configured!');
    return;
  }
  
  // Navigate to channel
  console.log('[YTR] Navigating to:', channelUrl);
  window.location.href = channelUrl;
  
  // Wait for page to load and play first video
  setTimeout(() => {
    console.log('[YTR] Page loaded, attempting to play first video...');
    playFirstVideoOnPage();
  }, 3000);
}

/**
 * Play the first video available on the page
 */
function playFirstVideoOnPage() {
  console.log('[YTR] === playFirstVideoOnPage ===');
  
  // Wait for video to appear
  const maxAttempts = 10;
  let attempts = 0;
  
  const tryPlayVideo = setInterval(() => {
    attempts++;
    console.log(`[YTR] Attempt ${attempts}/${maxAttempts} to find video...`);
    
    // Look for first video link
    const videoLink = document.querySelector('a#video-title, a[href*="/watch?v="]');
    
    if (videoLink) {
      console.log('[YTR] ✅ Found video link, clicking to play...');
      makeElementClickable(videoLink);
      videoLink.click();
      clearInterval(tryPlayVideo);
      showOverlay(`▶️ Now playing...`, 1500);
      console.log('[YTR] === Video clicked ===');
    } else {
      if (attempts >= maxAttempts) {
        console.log('[YTR] ❌ Could not find video to play after 10 attempts');
        clearInterval(tryPlayVideo);
      }
    }
  }, 300);
}

/**
 * Ensure element is clickable
 */
function makeElementClickable(element) {
  element.style.pointerEvents = 'auto';
  element.style.cursor = 'pointer';
}

/**
 * Listen for SPA navigation (yt-navigate-finish)
 */
function listenForNavigation() {
  console.log('[YTR] Setting up navigation listeners...');
  
  document.addEventListener('yt-navigate-finish', async () => {
    console.log('[YTR] 🔄 Navigation detected (yt-navigate-finish)');
    
    // Reset monitoring
    const video = document.querySelector('video');
    if (video) {
      delete video.dataset.ytrMonitored;
      console.log('[YTR] Reset video monitoring flag');
    }
    
    removeOverlay();
    
    // Wait for new page to load
    console.log('[YTR] Waiting for new page to load...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if this is a video page
    const newVideo = document.querySelector('video');
    if (newVideo) {
      console.log('[YTR] Video page detected after navigation, checking authorization...');
      await blockUnauthorizedContent();
      monitorCurrentVideo();
    } else {
      console.log('[YTR] Not a video page, just resetting monitoring');
      monitorCurrentVideo();
    }
  });

  // Also listen for popstate (back/forward navigation)
  window.addEventListener('popstate', async () => {
    console.log('[YTR] 🔙 Navigation detected (popstate - back/forward)');
    await new Promise(resolve => setTimeout(resolve, 800));
    const newVideo = document.querySelector('video');
    if (newVideo) {
      console.log('[YTR] Video page detected, checking authorization...');
      await blockUnauthorizedContent();
    }
  });
  
  console.log('[YTR] Navigation listeners attached');
}

/**
 * Verify element is in viewport or at least on page
 */
function isElementInViewport(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= -window.innerHeight &&
    rect.left >= -window.innerWidth &&
    rect.bottom <= window.innerHeight * 2 &&
    rect.right <= window.innerWidth * 2
  );
}

/**
 * Start initialization when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Reinitialize on dynamic content loads
const observer = new MutationObserver(() => {
  const video = document.querySelector('video');
  if (video && !video.dataset.ytrMonitored && CHANNEL_ID) {
    monitorCurrentVideo();
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
