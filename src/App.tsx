import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import { DonutChart } from './components/DonutChart'
import { Flame, BicepsFlexed, Lock, TrendingUp, TrendingDown } from 'lucide-react';

function App() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [dayStreak, setDayStreak] = useState(0)
  const [minOn, setMinOn] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(0)
  const [isTrending, setIsTrending] = useState(true)
  const [weeklyChange, setWeeklyChange] = useState(0)

  useEffect(() => {
    console.log("Toggle changed:", isEnabled)
    // DO STUFF
  }, [isEnabled])

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
