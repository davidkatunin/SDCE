import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import { DonutChart } from './components/DonutChart'
import { SiteToggle } from './components/SiteToggle'
import { Flame, BicepsFlexed, Lock, TrendingUp, TrendingDown, SlidersHorizontal, Instagram, Youtube, Facebook, Music2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";

function App() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [dayStreak, setDayStreak] = useState(0)
  const [minOn, setMinOn] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(0)
  const [isTrending, setIsTrending] = useState(true)
  const [weeklyChange, setWeeklyChange] = useState(0)
  const [blockedSites, setBlockedSites] = useState({
    Instagram: false,
    Youtube: false,
    Facebook: false,
    TikTok: false
  })
  // const [weeklyData, setWeeklyData] = useState([])

  const weeklyData = [
    { day: "Mon", minutes: 45 },
    { day: "Tue", minutes: 62 },
    { day: "Wed", minutes: 58 },
    { day: "Thu", minutes: 73 },
    { day: "Fri", minutes: 81 },
    { day: "Sat", minutes: 92 },
    { day: "Sun", minutes: 87 },
  ];

  useEffect(() => {
    console.log("Toggle changed:", isEnabled)
    // DO STUFF
  }, [isEnabled])

  const handleSiteToggle = (siteName: string, isBlocked: boolean) => {
    setBlockedSites(prev => ({
      ...prev,
      [siteName]: isBlocked
    }))
    console.log(`${siteName} is now ${isBlocked ? 'blocked' : 'unblocked'}`)
  }

// The settings button should open and have the user set their daily goal 

  return (
    <div className="px-4 w-[350px] h-[600px] bg-[#0a0a0a] relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <Nav isEnabled={isEnabled} onToggle={setIsEnabled} />
      {isEnabled ? 
        <div className="flex flex-col items-center gap-4">
          <div className={`flex flex-row items-center justify-center py-2 gap-3 w-full border-1 rounded-lg ${
            dayStreak === 0 
              ? 'border-purple-800 bg-gradient-to-r from-purple-500/30 to-blue-500/30' 
              : 'border-orange-800 bg-gradient-to-r from-orange-500/30 to-red-500/30'
          }`}>
            {(dayStreak == 0) ? 
              <>
                <Lock color='#e29eff' size={18}/>
                <p className='text-white text-[16px]'>Start your streak today!</p>
                <BicepsFlexed color='gold' size={18}/>
              </>
            :
              <>
                <Flame color='orange' size={18}/>
                <p className='text-white text-[16px]'>{dayStreak} Day Streak!</p>
                <Flame color='orange' size={18}/>
              </>
            }
          </div>
          <div className="w-full flex flex-row justify-between items-center rounded-lg px-4 py-3 border-1 border-gray-700 bg-gradient-to-r from-purple-500/15 to-blue-500/15">
            <div className="">
              <p className="text-gray-400 text-xs">Time saved today</p>
              <div className="flex flex-row items-end gap-1 py-1">
                <p className='text-white text-4xl'>{minOn}</p>
                <p className='text-gray-400 text-lg'>/ {dailyGoal} min</p>
              </div>
              <div className="flex flex-row text-sm">
                {isTrending == true ? 
                <div className="flex flex-row items-center gap-2 pt-1">
                  <TrendingUp color='green' size={18}/>
                  <p className='text-green-600 text-xs'>{weeklyChange}% less than last week</p>
                </div>
                :
                <div className="flex flex-row items-center gap-2 pt-1">
                  <TrendingDown color='red' size={18}/>
                  <p className='text-red-600 text-xs'>{weeklyChange}% more than last week</p>
                </div>
                }
              </div>
            </div>
            <DonutChart progress={(minOn/dailyGoal)} size={70} strokeWidth={6} />
          </div>
          <div className="w-full flex flex-col gap-1 justify-between items-center rounded-lg px-4 py-3 border-1 border-gray-700 bg-white/3">
            <div className="w-full flex flex-row justify-between">
              <p className="text-gray-400 text-xs">Time saved this week</p>
              <p className="text-gray-500 text-xs">min/day</p>
            </div>
            {weeklyData.length == 0 ? (
              <div className="w-full h-[85px] flex items-center justify-center">
                <p className='text-white'>No Weekly data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={85}>
                <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient
                      id="colorMinutes"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#a855f7"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#a855f7"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
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
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#colorMinutes)"
                    activeDot={{ r: 4, fill: "#a855f7", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
           <div className="w-full flex flex-col gap-2">
             <div className="flex flex-row w-full justify-between items-center">
               <p className="text-gray-400 text-xs">Blocked Sites</p>
               <SlidersHorizontal color='gold' size={15}/>
             </div>
             <div className="w-full flex flex-col gap-1 pb-3">
               <SiteToggle 
                 siteName="Instagram" 
                 siteIcon={<Instagram color='white' size={18}/>} 
                 isBlocked={blockedSites.Instagram} 
                 onToggle={handleSiteToggle} 
               />
               <SiteToggle 
                 siteName="Youtube" 
                 siteIcon={<Youtube color='white' size={18}/>} 
                 isBlocked={blockedSites.Youtube} 
                 onToggle={handleSiteToggle} 
               />
               <SiteToggle 
                 siteName="Facebook" 
                 siteIcon={<Facebook color='white' size={18}/>} 
                 isBlocked={blockedSites.Facebook} 
                 onToggle={handleSiteToggle} 
               />
               <SiteToggle 
                 siteName="TikTok" 
                 siteIcon={<Music2 color='white' size={18}/>} 
                 isBlocked={blockedSites.TikTok} 
                 onToggle={handleSiteToggle} 
               />
             </div>
           </div>
        </div>
        : 
        <div className="flex flex-col items-center justify-center h-[536px] text-center space-y-3 pb-22">
          <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="16" height="9" rx="2" ry="2"></rect>
              <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Extension paused</p>
          <p className="text-gray-700 text-sm">Turn on to start blocking distractions</p>
        </div> 
      }
    </div>
  )
}

export default App
