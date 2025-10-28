chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const title = tab?.title ?? 'Unknown';
    // Prefer native notifications; fallback to alert in-page via executeScript
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'vite.svg',
        title: 'Current Tab Title',
        message: title,
      });
    } else if (tab?.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (t) => alert(`Current Tab Title: ${t}`),
        args: [title],
      });
    }
  } catch (err) {
    console.error('Failed to show title', err);
  }
});

function checkIfPaused(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isPaused'], (result) => {
      const paused = Boolean(result.isPaused);
      resolve(paused);
    });
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    const newState = changes.isEnabled.newValue;
    checkIfPaused().then((isPaused) => {
      let shouldShow = !!newState && !isPaused;
      chrome.action.setIcon({
        path: shouldShow
          ? { "16": "icons/active16.png",
              "32": "icons/active32.png",
              "48": "icons/active48.png",
              "128": "icons/active128.png" 
            }
          : { "16": "icons/inactive16.png",
              "32": "icons/inactive32.png",
              "48": "icons/inactive48.png",
              "128": "icons/inactive128.png"
            }
      });
    });
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isPaused) {
    const newState = changes.isPaused.newValue;
    chrome.action.setIcon({
      path: newState
        ? { "16": "icons/inactive16.png",
            "32": "icons/inactive32.png",
            "48": "icons/inactive48.png",
            "128": "icons/inactive128.png"
         }
        : { "16": "icons/active16.png",
            "32": "icons/active32.png",
            "48": "icons/active48.png",
            "128": "icons/active128.png" 
          }
    });
  }
});