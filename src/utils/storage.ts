export interface ExtensionStorage {
    isEnabled: boolean;
    dailyGoal: number;
    pauseWhenGoalReached: boolean;
    blockedSites: Record<string, boolean>;
    pauseEndTime: number | null;
    pauseReason: string | null;
    isPaused: boolean;
    goalPauseAcknowledged: boolean;
    weeklyData: { day: string; minutes: number }[];
    dayStreak: number;
    minOn: number;
    weeklyChange: number;
    isTrending: boolean;
}

export const DEFAULT_STORAGE: ExtensionStorage = {
    isEnabled: true,
    dailyGoal: 0,
    pauseWhenGoalReached: false,
    blockedSites: {
        Instagram: false,
        YouTube: false,
        Facebook: false,
        TikTok: false,
    },
    weeklyData: [],
    pauseEndTime: null,
    pauseReason: null,
    isPaused: false,
    goalPauseAcknowledged: false,
    dayStreak: 0,
    minOn: 0,
    weeklyChange: 0,
    isTrending: true,
};

export async function initializeStorage(): Promise<ExtensionStorage> {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, (data) => {
        const merged: ExtensionStorage = {
            ...DEFAULT_STORAGE,
            ...data,
            blockedSites: {
            ...DEFAULT_STORAGE.blockedSites,
            ...(data.blockedSites || {}),
            },
        };

        if (Object.keys(data).length === 0) {
            chrome.storage.local.set(merged);
        }

        resolve(merged);
        });
    });
}

export async function updateStorage(partialData: Partial<ExtensionStorage>) {
    return new Promise<void>((resolve, reject) => {
        chrome.storage.local.set(partialData, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}
