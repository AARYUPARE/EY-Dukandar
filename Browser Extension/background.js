chrome.runtime.onMessage.addListener((msg, sender) => {

  if (msg.type === "SAVE_TAB") {
    chrome.storage.local.set({ originalTabId: sender.tab.id });
  }

  if (msg.type === "REDIRECT_TAB") {
    chrome.storage.local.get(["originalTabId"], (result) => {
      const tabId = result.originalTabId;

      if (tabId) {
        chrome.tabs.update(tabId, { url: msg.url, active: true }, (tab) => {
          chrome.windows.update(tab.windowId, { focused: true });
        });
      }
    });
  }
});