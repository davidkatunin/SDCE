import React from 'react'

interface NavProps {
  className?: string
  isEnabled: boolean
  onToggle: (value: boolean) => void
  onOpenSettings: () => void 
}

const Nav: React.FC<NavProps> = ({ isEnabled, onToggle, onOpenSettings }) => {

  return (
    <nav>
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[5px] flex items-center justify-center">
            <span className="block w-full h-full">
              <img src="icons/icon128.png" />
            </span>
          </div>
          <span className="ml-2 text-white font-semibold text-sm">Stop Doomscrolling</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 hover:cursor-pointer rounded-md transition-colors duration-200"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          {isEnabled ? <p className='text-gray-500 text-xs'>On</p> : <p className='text-gray-500 text-xs'>Off</p>}
          <button
            onClick={() => onToggle(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 hover:cursor-pointer ${
              isEnabled ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
            }`}
            role="switch"
            aria-checked={isEnabled}
            aria-label="Toggle extension"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Nav
