chrome.runtime.onInstalled.addListener(initBackground);
chrome.runtime.onStartup.addListener(initBackground);

function initBackground() {
  restorePauseAlarm();
  scheduleMidnightReset();
  restoreTrackingAlarm();
  updateIconFromStorage();
}

function restorePauseAlarm() {
  chrome.storage.local.get(["isPaused", "pauseEndTime"], ({ isPaused, pauseEndTime }) => {
    if (isPaused && pauseEndTime) {
      chrome.alarms.clear("pauseExpiry", () => {
        chrome.alarms.create("pauseExpiry", { when: pauseEndTime });
      });
    }
  });
}

function resumeExtension() {
  chrome.storage.local.set({ isPaused: false, pauseEndTime: null });
  chrome.alarms.clear("pauseExpiry");
}

function restoreTrackingAlarm() {
  chrome.storage.local.get(["isEnabled", "blockedSites", "isPaused"], ({ isEnabled, blockedSites, isPaused }) => {
    const hasAnyBlocked = Object.values(blockedSites || {}).some(v => v);
    if (isEnabled && hasAnyBlocked && !isPaused) {
      chrome.alarms.create("tracking", { periodInMinutes: 1 });
    }
  });
}

function startTracking() {
  chrome.alarms.create("tracking", { periodInMinutes: 1 });
}

function stopTracking() {
  chrome.alarms.clear("tracking");
}

function scheduleMidnightReset() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  ).getTime();

  chrome.alarms.create("midnightReset", { when: nextMidnight });
}

function resetDailyStats() {
  chrome.storage.local.get(["minOn", "weeklyData"], ({ minOn = 0, weeklyData = [] }) => {
    const today = new Date();
    const todayName = today.toLocaleDateString("en-US", { weekday: "short" });
    const isMonday = today.getDay() === 1;

    const newWeek = [
      { day: "Mon", minutes: 0 },
      { day: "Tue", minutes: 0 },
      { day: "Wed", minutes: 0 },
      { day: "Thu", minutes: 0 },
      { day: "Fri", minutes: 0 },
      { day: "Sat", minutes: 0 },
      { day: "Sun", minutes: 0 },
    ];

    if (!isMonday) {
      for (const d of newWeek) {
        const match = weeklyData.find((w: { day: string; minutes: number }) => w.day === d.day);
        if (match) d.minutes = match.minutes;
      }

      const todayIndex = newWeek.findIndex((d) => d.day === todayName);
      if (todayIndex >= 0) newWeek[todayIndex].minutes = minOn;
    }

    chrome.storage.local.set({
      weeklyData: newWeek,
      minOn: 0,
      lastUpdated: new Date().toLocaleDateString(),
    });
  });
}

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

function updateIconFromStorage() {
  chrome.storage.local.get(["isEnabled", "isPaused"], ({ isEnabled, isPaused }) => {
    updateIcon(isEnabled, isPaused);
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case "tracking": {
      const data = await chrome.storage.local.get(["timeTracked", "minOn", "weeklyData"]);
      const timeTracked = (data.timeTracked || 0) + 1;
      const minOn = (data.minOn || 0) + 1;
    
      const defaultWeek = [
        { day: "Mon", minutes: 0 },
        { day: "Tue", minutes: 0 },
        { day: "Wed", minutes: 0 },
        { day: "Thu", minutes: 0 },
        { day: "Fri", minutes: 0 },
        { day: "Sat", minutes: 0 },
        { day: "Sun", minutes: 0 },
      ];
    
      let weeklyData: { day: string; minutes: number }[] = Array.isArray(data.weeklyData) && data.weeklyData.length > 0
        ? data.weeklyData
        : defaultWeek;
    
      for (const d of defaultWeek) {
        if (!weeklyData.some((w) => w.day === d.day)) {
          weeklyData.push(d);
        }
      }
    
      const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
      const dayIndex = weeklyData.findIndex((d) => d.day === today);
      if (dayIndex >= 0) {
        weeklyData[dayIndex].minutes = minOn;
      }
    
      await chrome.storage.local.set({ timeTracked, minOn, weeklyData });
      break;
    }
            

    case "pauseExpiry":
      resumeExtension();
      break;

    case "midnightReset":
      resetDailyStats();
      scheduleMidnightReset();
      break;
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  // Pause alarm management
  if (changes.isPaused?.newValue === true && changes.pauseEndTime?.newValue) {
    chrome.alarms.create("pauseExpiry", { when: changes.pauseEndTime.newValue });
  } else if (changes.isPaused?.newValue === false) {
    chrome.alarms.clear("pauseExpiry");
  }

  if (changes.isEnabled || changes.isPaused) {
    updateIconFromStorage();
  }

  if (changes.isEnabled || changes.blockedSites || changes.isPaused) {
    chrome.storage.local.get(["isEnabled", "blockedSites", "isPaused"], ({ isEnabled, blockedSites, isPaused }) => {
      const hasAnyBlocked = Object.values(blockedSites || {}).some(v => v);
      if (isEnabled && hasAnyBlocked && !isPaused) {
        startTracking();
      } else {
        stopTracking();
      }
    });
  }
});
