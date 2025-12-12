chrome.runtime.onInstalled.addListener(initBackground);
chrome.runtime.onStartup.addListener(initBackground);

function storageGet(keys: string | string[] | null = null): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res) => resolve(res));
  });
}
function storageSet(obj: Record<string, any>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, () => resolve());
  });
}

async function initBackground() {
  await ensureLastUpdatedInitialized();
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

async function resumeExtension({ manualAck = false } = {}) {
  if (manualAck) {
    const { minOn = 0, dailyGoal = 0 } = await storageGet(["minOn", "dailyGoal"]);
    const acknowledged = minOn >= dailyGoal;
    await storageSet({
      isPaused: false,
      pauseEndTime: null,
      pauseReason: null,
      goalPauseAcknowledged: acknowledged
    });
  } else {
    await storageSet({
      isPaused: false,
      pauseEndTime: null,
      pauseReason: null,
      goalPauseAcknowledged: false
    });
  }
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

  const {
    minOn = 0,
    dailyGoal = 0,
    weeklyData = [],
    dayStreak = 0,
    lastUpdated
  } = await storageGet([
    "minOn",
    "dailyGoal",
    "weeklyData",
    "dayStreak",
    "lastUpdated"
  ]);

  const today = new Date();
  const todayDateStr = today.toLocaleDateString();
  const todayName = today.toLocaleDateString("en-US", { weekday: "short" });

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDateStr = yesterday.toLocaleDateString();
  const yesterdayName = yesterday.toLocaleDateString("en-US", { weekday: "short" });

  const defaultWeek = [
    { day: "Mon", minutes: 0 },
    { day: "Tue", minutes: 0 },
    { day: "Wed", minutes: 0 },
    { day: "Thu", minutes: 0 },
    { day: "Fri", minutes: 0 },
    { day: "Sat", minutes: 0 },
    { day: "Sun", minutes: 0 },
  ];

  const mergedWeek = defaultWeek.map(d => {
    const match = Array.isArray(weeklyData)
      ? weeklyData.find((w) => w.day === d.day)
      : undefined;
    return { day: d.day, minutes: match?.minutes ?? 0 };
  });

  let yesterdayMinutes = 0;
  if (lastUpdated === yesterdayDateStr) {
    yesterdayMinutes = minOn ?? 0;
  } else {
    const yEntry = mergedWeek.find(e => e.day === yesterdayName);
    yesterdayMinutes = yEntry ? (yEntry.minutes ?? 0) : 0;
  }

  const newStreak = (dailyGoal > 0 && yesterdayMinutes >= dailyGoal) ? (dayStreak || 0) + 1 : 0;

  const isSundayToMonday = yesterdayName === "Sun" && todayName === "Mon";
  const finalWeek = isSundayToMonday
    ? defaultWeek.map(d => ({ ...d }))
    : mergedWeek.map(d => ({ ...d }));

  const todayEntry = finalWeek.find(d => d.day === todayName);
  if (todayEntry) todayEntry.minutes = 0;

  await storageSet({
    weeklyData: finalWeek,
    minOn: 0,
    timeTracked: 0,
    dayStreak: newStreak,
    lastUpdated: todayDateStr,
    lastUpdatedDay: today.getDay(),
    isPaused: false,
    pauseEndTime: null,
    pauseReason: null,
    goalPauseAcknowledged: false,
  });

  const { isEnabled, blockedSites, isPaused } = await storageGet(["isEnabled", "blockedSites", "isPaused"]);
  const hasAnyBlocked = Object.values(blockedSites || {}).some(v => v);
  if (isEnabled && hasAnyBlocked && !isPaused) {
    chrome.alarms.create("tracking", { periodInMinutes: 1 });
  }
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
      const { isPaused } = await storageGet("isPaused");
      if (isPaused) return;

      const todayString = new Date().toLocaleDateString();
      const stored = await storageGet("lastUpdated");
      const lastUpdated = stored?.lastUpdated;
      if (lastUpdated !== todayString) {
        await resetDailyStats();
        return;
      }

      const data = await storageGet(["timeTracked", "minOn", "weeklyData", "dailyGoal", "pauseWhenGoalReached", "goalPauseAcknowledged"]);
      const timeTracked = (data.timeTracked || 0) + 1;
      const minOn = (data.minOn || 0) + 1;

      const shouldPause =
        !!data.pauseWhenGoalReached &&
        data.dailyGoal > 0 &&
        minOn >= data.dailyGoal &&
        !data.goalPauseAcknowledged;

      if (shouldPause) {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        await storageSet({
          isPaused: true,
          pauseEndTime: midnight.getTime(),
          pauseReason: "goalMet",
          goalPauseAcknowledged: false
        });
        chrome.alarms.create("pauseExpiry", { when: midnight.getTime() });
        stopTracking();
      }

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
          ? data.weeklyData.slice()
          : defaultWeek.slice();

      for (const d of defaultWeek) {
        if (!weeklyData.some(w => w.day === d.day)) weeklyData.push({ ...d });
      }

      const todayName = new Date().toLocaleDateString("en-US", { weekday: "short" });
      const dayIndex = weeklyData.findIndex(d => d.day === todayName);
      if (dayIndex >= 0) weeklyData[dayIndex].minutes = minOn;

      await storageSet({ timeTracked, minOn, weeklyData });
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
  const { lastUpdated } = await storageGet("lastUpdated");
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

async function ensureLastUpdatedInitialized() {
  const { lastUpdated, lastUpdatedDay } = await storageGet(["lastUpdated", "lastUpdatedDay"]);

  if (!lastUpdated || lastUpdatedDay === undefined) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await storageSet({
      lastUpdated: yesterday.toLocaleDateString(),
      lastUpdatedDay: yesterday.getDay(),
    });
  }
}
