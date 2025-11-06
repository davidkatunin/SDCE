chrome.runtime.onInstalled.addListener(initBackground);
chrome.runtime.onStartup.addListener(initBackground);

async function initBackground() {
  await checkMissedReset();
  initializeWeeklyDataIfNeeded();
  restorePauseAlarm();
  scheduleMidnightReset();
  restoreTrackingAlarm();
  updateIconFromStorage();
}

function initializeWeeklyDataIfNeeded() {
  chrome.storage.local.get(["weeklyData"], ({ weeklyData }) => {
    if (!Array.isArray(weeklyData) || weeklyData.length === 0) {
      const defaultWeek = [
        { day: "Mon", minutes: 0 },
        { day: "Tue", minutes: 0 },
        { day: "Wed", minutes: 0 },
        { day: "Thu", minutes: 0 },
        { day: "Fri", minutes: 0 },
        { day: "Sat", minutes: 0 },
        { day: "Sun", minutes: 0 },
      ];
      chrome.storage.local.set({ weeklyData: defaultWeek });
    }
  });
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

async function resetDailyStats(): Promise<void> {
  chrome.alarms.clear("tracking");
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["minOn", "dailyGoal", "weeklyData", "dayStreak", "lastUpdated"],
      ({ minOn = 0, dailyGoal = 0, weeklyData = [], dayStreak = 0 }) => {
        const todayName = new Date().toLocaleDateString("en-US", { weekday: "short" });

        const defaultWeek = [
          { day: "Mon", minutes: 0 },
          { day: "Tue", minutes: 0 },
          { day: "Wed", minutes: 0 },
          { day: "Thu", minutes: 0 },
          { day: "Fri", minutes: 0 },
          { day: "Sat", minutes: 0 },
          { day: "Sun", minutes: 0 },
        ];

        const normalizedWeek: { day: string; minutes: number }[] = [...defaultWeek];
        if (Array.isArray(weeklyData)) {
          for (const w of weeklyData) {
            const idx = normalizedWeek.findIndex(d => d.day === w.day);
            if (idx >= 0) normalizedWeek[idx].minutes = w.minutes ?? 0;
          }
        }

        const todayIndex = normalizedWeek.findIndex(d => d.day === todayName);
        if (todayIndex >= 0) normalizedWeek[todayIndex].minutes = minOn;

        let newStreak = dayStreak ?? 0;
        if (dailyGoal > 0 && (minOn >= dailyGoal)) {
          newStreak = (dayStreak || 0) + 1;
        } else {
          newStreak = dayStreak || 0;
        }

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const isNextDayMonday = tomorrow.getDay() === 1;
        const finalWeekly = isNextDayMonday
          ? normalizedWeek.map(d => ({ ...d, minutes: 0 }))
          : normalizedWeek;

        const todayString = new Date().toLocaleDateString();

        chrome.storage.local.set({
          weeklyData: finalWeekly,
          minOn: 0,
          timeTracked: 0,
          dayStreak: newStreak,
          lastUpdated: todayString,
        }, () => {
          chrome.alarms.create("tracking", { periodInMinutes: 1 });
          resolve();
        });
      }
    );
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
      const { isPaused } = await chrome.storage.local.get("isPaused");
      if (isPaused) return;
      const todayString = new Date().toLocaleDateString();
      const stored = await chrome.storage.local.get(["lastUpdated"]);
      const lastUpdated = stored.lastUpdated;

      if (lastUpdated !== todayString) {
        await resetDailyStats();
        return;
      }

      const data = await chrome.storage.local.get(["timeTracked", "minOn", "weeklyData", "dailyGoal"]);
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

      let weeklyData: { day: string; minutes: number }[] =
        Array.isArray(data.weeklyData) && data.weeklyData.length > 0
          ? data.weeklyData
          : defaultWeek.slice();

      for (const d of defaultWeek) {
        if (!weeklyData.some(w => w.day === d.day)) weeklyData.push({ ...d });
      }

      const todayName = new Date().toLocaleDateString("en-US", { weekday: "short" });
      const dayIndex = weeklyData.findIndex(d => d.day === todayName);
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
      await resetDailyStats();
      scheduleMidnightReset();
      break;
  }
});

async function checkMissedReset() {
  const { lastUpdated } = await chrome.storage.local.get("lastUpdated");
  const today = new Date().toLocaleDateString();

  if (lastUpdated !== today) {
    await resetDailyStats();
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

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
