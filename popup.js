/**
 * YouTube Channel Restrictor - Popup Script
 * Handles settings and configuration
 */

document.addEventListener('DOMContentLoaded', () => {
  const inputType = document.getElementById('inputType');
  const channelInput = document.getElementById('channelInput');
  const channelNameInput = document.getElementById('channelName');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusMessage = document.getElementById('status');
  const helpText = document.getElementById('helpText');

  // Load saved settings
  loadSettings();

  // Handle input type change
  inputType.addEventListener('change', (e) => {
    if (e.target.value === 'handle') {
      channelInput.placeholder = 'e.g., @tech-gamerz7292';
      helpText.textContent = 'Use the @handle from your channel URL (e.g., https://www.youtube.com/@tech-gamerz7292)';
      channelInput.value = '';
    } else {
      channelInput.placeholder = 'e.g., UC1234567890abcdefghijk';
      helpText.textContent = 'Find your channel ID in YouTube Studio → Settings → Channel → Basic Info';
      channelInput.value = '';
    }
    channelInput.focus();
  });

  // Save button
  saveBtn.addEventListener('click', saveSettings);

  // Test button
  testBtn.addEventListener('click', () => {
    const input = channelInput.value.trim();
    const type = inputType.value;
    
    if (!input) {
      showStatus('Please enter a channel first', 'error');
      return;
    }
    
    let testUrl = '';
    if (type === 'handle') {
      const handle = input.startsWith('@') ? input : `@${input}`;
      testUrl = `https://www.youtube.com/${handle}`;
    } else {
      testUrl = `https://www.youtube.com/channel/${input}`;
    }
    
    chrome.tabs.create({ url: testUrl });
    showStatus('Opening channel in new tab...', 'info');
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all settings?')) {
      chrome.storage.sync.remove(['channelId', 'channelHandle', 'channelName'], () => {
        channelInput.value = '';
        channelNameInput.value = '';
        showStatus('✅ Settings cleared', 'success');
      });
    }
  });

  /**
   * Load settings from storage
   */
  function loadSettings() {
    chrome.storage.sync.get(['channelId', 'channelHandle', 'channelName'], (data) => {
      if (data.channelHandle) {
        inputType.value = 'handle';
        channelInput.placeholder = 'e.g., @tech-gamerz7292';
        helpText.textContent = 'Use the @handle from your channel URL';
        channelInput.value = data.channelHandle;
        channelNameInput.value = data.channelName || '';
      } else if (data.channelId) {
        inputType.value = 'id';
        channelInput.placeholder = 'e.g., UC1234567890abcdefghijk';
        helpText.textContent = 'Find your channel ID in YouTube Studio';
        channelInput.value = data.channelId;
        channelNameInput.value = data.channelName || '';
      }
    });
  }

  /**
   * Validate channel ID format
   */
  function validateChannelId(channelId) {
    // YouTube channel IDs start with UC and are 24 characters
    const channelIdRegex = /^UC[a-zA-Z0-9_-]{22}$/;
    return channelIdRegex.test(channelId);
  }

  /**
   * Validate channel handle format
   */
  function validateChannelHandle(handle) {
    // Remove @ if present
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
    // Handle can contain letters, numbers, hyphens, periods, underscores
    const handleRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
    return handleRegex.test(cleanHandle);
  }

  /**
   * Save settings
   */
  function saveSettings() {
    const type = inputType.value;
    const input = channelInput.value.trim();
    const channelName = channelNameInput.value.trim();

    // Validation
    if (!input) {
      showStatus('❌ Please enter a channel', 'error');
      return;
    }

    if (!channelName) {
      showStatus('❌ Please enter a Channel Name', 'error');
      return;
    }

    let dataToSave = {};

    if (type === 'handle') {
      if (!validateChannelHandle(input)) {
        showStatus('❌ Invalid channel handle format. Use @handle or handle format', 'error');
        return;
      }
      const cleanHandle = input.startsWith('@') ? input.substring(1) : input;
      dataToSave = {
        channelHandle: cleanHandle,
        channelName: channelName
      };
      // Remove old channelId if switching
      chrome.storage.sync.remove(['channelId']);
    } else {
      if (!validateChannelId(input)) {
        showStatus('❌ Invalid Channel ID format. Channel IDs must start with "UC" and be 24 characters', 'error');
        return;
      }
      dataToSave = {
        channelId: input,
        channelName: channelName
      };
      // Remove old channelHandle if switching
      chrome.storage.sync.remove(['channelHandle']);
    }

    // Save to storage
    chrome.storage.sync.set(dataToSave, () => {
      showStatus(`✅ Settings saved! Restricting to "${channelName}"`, 'success');
      
      // Notify all tabs that settings changed
      chrome.tabs.query({ url: 'https://www.youtube.com/*' }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'settingsUpdated',
            ...dataToSave
          }).catch(() => {
            // Tab might not have content script loaded
          });
        });
      });
    });
  }

  /**
   * Show status message
   */
  function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message show ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.classList.remove('show');
      }, 3000);
    }
  }

  // Allow Enter key to save
  channelInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      channelNameInput.focus();
    }
  });

  channelNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveSettings();
    }
  });
});
