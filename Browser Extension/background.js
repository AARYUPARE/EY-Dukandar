chrome.runtime.onMessage.addListener((msg, sender) => {

  /* ===== Save tab + brand ===== */
  if (msg.type === "SAVE_TAB") {
    const url = new URL(sender.tab.url);
    const subdomain = url.hostname.split(".")[0];

    const brandMap = {
      vanheusenindia: "Van Heusen",
      allensolly: "Allen Solly",
      peterengland: "Peter England",
      louisphilippe: "Louis Philippe"
    };

    const brand = brandMap[subdomain] || subdomain;

    chrome.storage.local.set({
      originalTabId: sender.tab.id,
      brandName: brand
    });
  }

  /* ===== Redirect original tab ===== */
  if (msg.type === "REDIRECT_TAB") {
    chrome.storage.local.get(["originalTabId"], (result) => {
      const tabId = result.originalTabId;

      console.log("Result: ",result)
      console.log("Message: ",msg)

      if (tabId) {
        chrome.tabs.update(tabId, { url: msg.url, active: true }, (tab) => {
          chrome.windows.update(tab.windowId, { focused: true });
        });
      }
    });
  }
});

