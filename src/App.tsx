import { useEffect, useState } from 'react'

function App() {
  const [title, setTitle] = useState<string>('')

  useEffect(() => {
    const hasChromeTabs = typeof chrome !== 'undefined' && !!chrome.tabs?.query
    if (!hasChromeTabs) {
      setTitle('Open this as an extension popup to view the tab title')
      return
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const current = tabs[0]
      setTitle(current?.title ?? 'Unknown')
    })
  }, [])

  return (
    <div className="p-4 w-[350px] h-[200px] bg-[#040404]">
      <h2 className="m-0 mb-2 text-lg font-semibold">Current Tab Title</h2>
      <div className="break-words">{title || 'Loading...'}</div>
    </div>
  )
}

export default App
