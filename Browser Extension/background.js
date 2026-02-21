let originalTabId = null;

chrome.runtime.onMessage.addListener((msg, sender) => {

  // Save original tab
  if (msg.type === "SAVE_TAB") {
    originalTabId = sender.tab.id;
  }

  // Redirect original tab
  if (msg.type === "REDIRECT_TAB") {
    if (originalTabId) {
      chrome.tabs.update(originalTabId, { url: msg.url });
    }
  }
});
