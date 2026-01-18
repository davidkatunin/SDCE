# Stop Doomscrolling Chrome Extension

A **privacy-first Chrome extension** designed to reduce doomscrolling by blocking distracting sites, tracking time saved, and encouraging healthy daily habits through goals and streaks.

Built with **React**, **TypeScript**, **Tailwind CSS**, and **Chrome Extension APIs**.

---

## 🚀 Current Features

- ⏱️ **Daily time tracking** for blocked sites  
- 🎯 **Custom daily goals** with optional auto-pause when reached  
- 🔥 **Daily streak system** to build consistency  
- 📊 **Weekly usage chart** with automatic week resets  
- ⏸️ **Manual pause controls** (15 / 30 / 60 minutes)  
- 🌙 **Automatic midnight resets**, robust to browser restarts  
- 🔒 **100% local data storage** — no accounts, no tracking, no servers  

---

## 🧠 How It Works

- The extension tracks time not spent doomscrolling in **1-minute intervals**
- At **midnight**:
  - Daily usage resets
  - Streaks are updated based on goal completion
  - Weekly data rolls over (Sunday → Monday resets the full week)
- Optional behavior automatically **pauses blocking** once a daily goal is met
- All logic runs in the **background service worker** using `chrome.alarms`

---

## 🛠️ Tech Stack

- **React + TypeScript** – UI and state management  
- **Tailwind CSS** – Styling  
- **Chrome Extension APIs** – Storage, alarms, background logic  
- **Recharts** – Weekly usage visualization  

---

## 📦 Project Structure

```txt
src/
├─ background.ts        # Core tracking, reset, and pause logic
├─ App.tsx              # Main popup UI
├─ components/          # UI components
├─ lib/
│  └─ utils.ts          # Shared utilities/helpers
└─ utils/
   └─ storage.ts        # Typed storage helpers

public/
└─ icons/               # Extension icons
