import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import { DonutChart } from './components/DonutChart'
import { SiteToggle } from './components/SiteToggle'
import {
  Flame, TrendingUp, TrendingDown, SlidersHorizontal,
  Instagram, Youtube, Facebook, Music2, Pause, Sparkles
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { SettingsPopup } from './components/SettingsPopup';
import { Button } from './components/ui/button';
import { initializeStorage, updateStorage, ExtensionStorage } from './utils/storage';

function App() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [dayStreak, setDayStreak] = useState(0);
  const [minOn, setMinOn] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [isTrending, setIsTrending] = useState(true);
  const [weeklyChange, setWeeklyChange] = useState(0);
  const [pauseWhenGoalReached, setPauseWhenGoalReached] = useState(false);
  const [blockedSites, setBlockedSites] = useState<ExtensionStorage["blockedSites"]>({
    Instagram: false,
    YouTube: false,
    Facebook: false,
    TikTok: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseEndTime, setPauseEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('00:00');
  const [pauseReason, setPauseReason] = useState<string | null>(null);

  useEffect(() => {
    initializeStorage().then((data) => {
      setIsEnabled(data.isEnabled);
      setDailyGoal(data.dailyGoal);
      setPauseWhenGoalReached(data.pauseWhenGoalReached);
      setBlockedSites(data.blockedSites);
      setDayStreak(data.dayStreak);
      setMinOn(data.minOn || 0);
      setWeeklyChange(data.weeklyChange);
      setIsTrending(data.isTrending);
      setWeeklyData(data.weeklyData || [
        { day: "Mon", minutes: 0 },
        { day: "Tue", minutes: 0 },
        { day: "Wed", minutes: 0 },
        { day: "Thu", minutes: 0 },
        { day: "Fri", minutes: 0 },
        { day: "Sat", minutes: 0 },
        { day: "Sun", minutes: 0 },
      ]);
      setPauseReason(data.pauseReason || null);
      
      if (data.isPaused && data.pauseEndTime && data.pauseEndTime > Date.now()) {
        setIsPaused(true);
        setPauseEndTime(data.pauseEndTime);
      } else {
        setIsPaused(false);
      }
    });
  }, []);
  
  useEffect(() => {
    updateStorage({ isEnabled });
  }, [isEnabled]);
  
  useEffect(() => {
    updateStorage({ dailyGoal });
  }, [dailyGoal]);
  
  useEffect(() => {
    updateStorage({ blockedSites });
  }, [blockedSites]);
  
  useEffect(() => {
    updateStorage({ pauseWhenGoalReached });
  }, [pauseWhenGoalReached]);  

  const handlePause = (minutes: number) => {
    const end = Date.now() + minutes * 60 * 1000;
    const initialDiff = end - Date.now();
    const initialMinutes = Math.floor(initialDiff / 60000);
    const initialSeconds = Math.floor((initialDiff % 60000) / 1000);
    setRemainingTime(`${initialMinutes}:${initialSeconds.toString().padStart(2, '0')}`);
  
    setPauseEndTime(end);
    setIsPaused(true);
    setShowSettings(false);
  
    chrome.storage.local.set({ pauseEndTime: end, isPaused: true });
  };
  
  const handleResume = () => {
    setIsPaused(false);
    setPauseEndTime(null);
    setRemainingTime('00:00');
    setPauseReason(null);
    chrome.storage.local.set({ isPaused: false, pauseReason: null });
    chrome.storage.local.remove(['pauseEndTime']);
  };

  useEffect(() => {
    if (!isPaused || !pauseEndTime) return;
  
    const updateTime = () => {
      const now = Date.now();
      const diff = pauseEndTime - now;
      if (diff <= 0) {
        handleResume();
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
  
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isPaused, pauseEndTime]);

  const handleSiteToggle = (siteName: string, isBlocked: boolean) => {
    const updatedSites = { ...blockedSites, [siteName]: isBlocked };
    setBlockedSites(updatedSites);
    updateStorage({ blockedSites: updatedSites });
  };  

  const [weeklyData, setWeeklyData] = useState([
    { day: "Mon", minutes: 0 },
    { day: "Tue", minutes: 0 },
    { day: "Wed", minutes: 0 },
    { day: "Thu", minutes: 0 },
    { day: "Fri", minutes: 0 },
    { day: "Sat", minutes: 0 },
    { day: "Sun", minutes: 0 },
  ]);
  
  useEffect(() => {
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.minOn) setMinOn(changes.minOn.newValue);
      if (changes.weeklyData) {
        const newWeekly = Array.isArray(changes.weeklyData.newValue)
          ? [...changes.weeklyData.newValue]
          : [];
        setWeeklyData(newWeekly);
      }
      if (changes.dayStreak) {
        setDayStreak(changes.dayStreak.newValue);
      }
      if (changes.pauseReason) {
        setPauseReason(changes.pauseReason.newValue);
      }
      if (changes.isPaused) {
        setIsPaused(changes.isPaused.newValue);
      }
      if (changes.pauseEndTime) {
        setPauseEndTime(changes.pauseEndTime.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);  

  const handleOpenSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);

  return (
    <div className="px-4 w-[350px] h-[600px] bg-[#0a0a0a] relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <Nav
        isEnabled={isEnabled}
        onToggle={setIsEnabled}
        onOpenSettings={handleOpenSettings}
      />
      {isEnabled ? (
        <div className="flex flex-col items-center gap-4">
          {isPaused ? (
            pauseReason === "goalMet" ? (
              <div
                className="flex items-center justify-between px-3 h-10
                bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30
                rounded-xl border border-purple-500/30 w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-sm font-semibold">Goal Reached</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResume}
                  className="h-6 px-2 text-xs text-purple-200 hover:text-white hover:bg-purple-500/10"
                >
                  Resume
                </Button>
              </div>
            ) : (            
              <div className="flex items-center justify-between gap-2 py-2 px-4 
                bg-gradient-to-r from-amber-500/20 to-orange-500/20 
                rounded-xl border border-amber-500/30 w-full"
              >
                <div className="flex items-center gap-2">
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span className="text-white">Paused</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">{remainingTime}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResume}
                    className="h-6 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  >
                    Resume
                  </Button>
                </div>
              </div>
            )
          ) : dayStreak > 0 ? (
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30 w-full">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-white">{dayStreak} Day Streak!</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30 w-full">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Start your streak today! 💪</span>
            </div>
          )}
          <div className="w-full flex flex-row justify-between items-center rounded-lg px-4 py-3 border-1 border-gray-700 bg-gradient-to-r from-purple-500/15 to-blue-500/15">
            <div>
              <p className="text-gray-400 text-xs">Time saved today</p>
              <div className="flex flex-row items-end gap-1 py-1">
                <p className='text-white text-4xl'>{minOn}</p>
                <p className='text-gray-400 text-lg'>/ {dailyGoal} min</p>
              </div>
              <div className="flex flex-row text-sm">
                {isTrending ? (
                  <div className="flex flex-row items-center gap-2 pt-1">
                    <TrendingUp color='green' size={18}/>
                    <p className='text-green-600 text-xs'>{weeklyChange}% less than last week</p>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2 pt-1">
                    <TrendingDown color='red' size={18}/>
                    <p className='text-red-600 text-xs'>{weeklyChange}% more than last week</p>
                  </div>
                )}
              </div>
            </div>
            <DonutChart
              progress={dailyGoal ? Math.min((minOn / dailyGoal) * 100, 100) : 0}
              size={70}
              strokeWidth={6}
            />
          </div>
          <div className="w-full flex flex-col gap-1 justify-between items-center rounded-lg px-4 py-3 border-1 border-gray-700 bg-white/3">
            <div className="w-full flex flex-row justify-between">
              <p className="text-gray-400 text-xs">Time saved this week</p>
              <p className="text-gray-500 text-xs">min/day</p>
            </div>
            <ResponsiveContainer width="100%" height={85}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-gray-400 text-xs">{payload[0].payload.day}</p>
                          <p className="text-white font-medium">{payload[0].value} min</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#a855f7" strokeWidth={2} fill="url(#colorMinutes)" activeDot={{ r: 4, fill: "#a855f7", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-row w-full justify-between items-center">
              <p className="text-gray-400 text-xs">Blocked Sites</p>
              <SlidersHorizontal color='gold' size={15}/>
            </div>
            <div className="w-full flex flex-col gap-1 pb-3">
              <SiteToggle siteName="Instagram" siteIcon={<Instagram color='white' size={18}/>} isBlocked={blockedSites.Instagram} onToggle={handleSiteToggle} />
              <SiteToggle siteName="YouTube" siteIcon={<Youtube color='white' size={18}/>} isBlocked={blockedSites.YouTube} onToggle={handleSiteToggle} />
              <SiteToggle siteName="Facebook" siteIcon={<Facebook color='white' size={18}/>} isBlocked={blockedSites.Facebook} onToggle={handleSiteToggle} />
              <SiteToggle siteName="TikTok" siteIcon={<Music2 color='white' size={18}/>} isBlocked={blockedSites.TikTok} onToggle={handleSiteToggle} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[536px] text-center space-y-3 pb-22">
          <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="9" rx="2" ry="2"></rect>
              <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Extension paused</p>
          <p className="text-gray-700 text-sm">Turn on to start blocking distractions</p>
        </div>
      )}
      {showSettings && (
        <SettingsPopup
          onClose={handleCloseSettings}
          onSaveGoal={(goal, pauseWhenGoal) => {
            setDailyGoal(goal);
            setPauseWhenGoalReached(pauseWhenGoal);
            updateStorage({
              dailyGoal: goal,
              pauseWhenGoalReached: pauseWhenGoal,
            });
          }}                   
          onPause={handlePause}
          currentGoal={dailyGoal}
          pauseWhenGoalReached={pauseWhenGoalReached}
        />
      )}
    </div>
  );
}

export default App;
