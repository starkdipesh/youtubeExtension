/**
 * YouTube Channel Restrictor - Service Worker (Background)
 * Handles extension lifecycle and background tasks
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[YTR] Extension installed');
    // Open popup or settings page
    chrome.runtime.openURL(chrome.runtime.getURL('popup.html'));
  } else if (details.reason === 'update') {
    console.log('[YTR] Extension updated');
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getChannelData') {
    chrome.storage.sync.get(['channelId', 'channelHandle', 'channelName'], (data) => {
      sendResponse({
        channelId: data.channelId || null,
        channelHandle: data.channelHandle || null,
        channelName: data.channelName || null
      });
    });
    return true; // Will respond asynchronously
  }

  if (request.action === 'setChannelData') {
    const dataToSave = {
      channelName: request.channelName
    };
    
    if (request.channelId) {
      dataToSave.channelId = request.channelId;
    } else if (request.channelHandle) {
      dataToSave.channelHandle = request.channelHandle;
    }
    
    chrome.storage.sync.set(dataToSave, () => {
      console.log('[YTR] Channel data saved');
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('[YTR] Service Worker initialized');
