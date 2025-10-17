chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const title = tab?.title ?? 'Unknown';
    if (tab?.id) {
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


