chrome.runtime.onInstalled.addListener(() => {
  restoreAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  restoreAlarm();
});

function restoreAlarm() {
  chrome.storage.local.get(["isPaused", "pauseEndTime"], ({ isPaused, pauseEndTime }) => {
    if (isPaused && pauseEndTime) {
      const now = Date.now();
      const timeLeft = pauseEndTime - now;
      if (timeLeft > 0) {
        chrome.alarms.create("pauseExpiry", { when: pauseEndTime });
      } else {
        resumeExtension();
      }
    }
  });
}

function resumeExtension() {
  chrome.storage.local.set({ isPaused: false, pauseEndTime: null });
  chrome.alarms.clear("pauseExpiry");
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pauseExpiry") {
    resumeExtension();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.isPaused?.newValue === true && changes.pauseEndTime?.newValue) {
    chrome.alarms.create("pauseExpiry", { when: changes.pauseEndTime.newValue });
  }

  if (changes.isPaused?.newValue === false) {
    chrome.alarms.clear("pauseExpiry");
  }

  if (changes.isEnabled || changes.isPaused) {
    chrome.storage.local.get(["isEnabled", "isPaused"], ({ isEnabled, isPaused }) => {
      updateIcon(isEnabled, isPaused);
    });
  }
});

function updateIcon(isEnabled: boolean, isPaused: boolean) {
  const active = !!isEnabled && !isPaused;
  chrome.action.setIcon({
    path: active
      ? {
          "16": "icons/active16.png",
          "32": "icons/active32.png",
          "48": "icons/active48.png",
          "128": "icons/active128.png",
        }
      : {
          "16": "icons/inactive16.png",
          "32": "icons/inactive32.png",
          "48": "icons/inactive48.png",
          "128": "icons/inactive128.png",
        },
  });
}
