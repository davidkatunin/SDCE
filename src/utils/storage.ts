export interface ExtensionStorage {
    isEnabled: boolean;
    dailyGoal: number;
    pauseWhenGoalReached: boolean;
    blockedSites: Record<string, boolean>;
    pauseEndTime: number | null;
    isPaused: boolean;
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
        instagram: false,
        youtube: false,
        facebook: false,
        tiktok: false,
    },
    weeklyData: [],
    pauseEndTime: null,
    isPaused: false,
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
