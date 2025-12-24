// FocusDock Background Service Worker (Manifest V3)

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  
  // Send message to content script to toggle sidebar
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
  } catch (error) {
    // Content script not loaded yet, inject it first
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content.css']
    });
    // Try again after injection
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
      } catch (e) {
        console.error('Failed to toggle sidebar:', e);
      }
    }, 100);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPageInfo' && sender.tab) {
    sendResponse({
      title: sender.tab.title || 'Untitled',
      url: sender.tab.url || '',
      favicon: sender.tab.favIconUrl || ''
    });
    return true;
  }
});

// Initialize storage with default values on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['focusdock_tasks'], (result) => {
    if (!result.focusdock_tasks) {
      chrome.storage.local.set({
        focusdock_tasks: [],
        focusdock_settings: {
          apiKey: null
        }
      });
    }
  });
  console.log('FocusDock installed successfully!');
});
