let originalTabId = null;

chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log("Background received:", msg);

  if (msg.type === "SAVE_TAB") {
    originalTabId = sender.tab.id;
    console.log("Saved tab:", originalTabId);
  }

  if (msg.type === "REDIRECT_TAB") {
    console.log("Redirect request:", msg.url);

    if (originalTabId) {
      chrome.tabs.update(originalTabId, { url: msg.url, active: true }, (tab) => {
        chrome.windows.update(tab.windowId, { focused: true });
      });
    }
  }
});