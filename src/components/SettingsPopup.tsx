import { useState, useEffect } from "react";
import { Settings } from "lucide-react";

interface SettingsPopupProps {
  onClose: () => void;
  onSaveGoal: (goal: number, pauseWhenGoalReached: boolean) => void;
  onPause: (minutes: number) => void;
  currentGoal: number;
  pauseWhenGoalReached: boolean;
}

export function SettingsPopup({
  onClose,
  onSaveGoal,
  onPause,
  currentGoal,
  pauseWhenGoalReached: initialPauseSetting,
}: SettingsPopupProps) {
  const [goal, setGoal] = useState(currentGoal);
  const [pauseWhenGoalReached, setPauseWhenGoalReached] = useState(initialPauseSetting);

  useEffect(() => {
    setGoal(currentGoal);
    setPauseWhenGoalReached(initialPauseSetting);
  }, [currentGoal, initialPauseSetting]);

  const handleSave = () => {
    onSaveGoal(goal, pauseWhenGoalReached);
    onClose();
  };

  const togglePauseSetting = () => {
    setPauseWhenGoalReached(prev => !prev);
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#121212] border border-gray-700 rounded-xl w-[300px] p-5 shadow-lg">
        <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> Settings
        </h2>

        {/* Daily goal input */}
        <div className="flex flex-col gap-3 mb-4">
          <label htmlFor="goal" className="text-gray-400 text-sm">
            Daily Goal (minutes)
          </label>
          <input
            id="goal"
            type="number"
            value={goal}
            min={30}
            max={300}
            step={15}
            onChange={e => setGoal(Number(e.target.value))}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-gray-500 text-xs">Set your daily time-saving goal</p>
        </div>

        {/* Pause When Goal Reached toggle */}
        <div className="flex items-center gap-3 mb-4">
          <label htmlFor="pause-goal-toggle" className="text-gray-400 text-sm flex-1">
            Pause when goal reached
          </label>
          <button
            id="pause-goal-toggle"
            type="button"
            onClick={togglePauseSetting}
            role="switch"
            aria-checked={pauseWhenGoalReached}
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-all duration-200 ${
              pauseWhenGoalReached
                ? "bg-gradient-to-r from-blue-500 to-purple-600"
                : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                pauseWhenGoalReached ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Pause Timer shortcuts */}
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-gray-400 text-sm mb-1">Pause blocking for:</p>
          <div className="flex gap-2">
            {[.1, 30, 60].map((m) => (
              <button
                key={m}
                onClick={() => onPause(m)}
                className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-md py-1 text-sm transition-colors"
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-row gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm px-3 py-1 mt-3 flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-3 py-1 rounded-md mt-3 flex-1"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
