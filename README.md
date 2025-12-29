# React Chrome Extension (Vite + React + TypeScript)

Personal Chrome extension starter built with React and Vite using TypeScript. This repo lives in my GitHub portfolio and is meant to be a clean, modern base for experimenting with UI ideas, background scripts, and Chrome APIs all for an attempt to end doomscrolling!


## Requirements
- Node.js 18 or 20
- npm

## Setup
```sh
git clone <your-fork-url>
cd chrome-extension-react-template
npm install
```

## Develop
Runs the Vite dev server with fast refresh:
```sh
npm run dev
```
Vite will open a browser tab; for extension-specific flows, load the dev build in Chrome as below.

## Build
Creates a production-ready bundle in `build/`:
```sh
npm run build
```

## Load the Extension in Chrome
    1) Open `chrome://extensions/`
    2) Toggle on Developer mode (top right)
    3) Click **Load unpacked** and select the `build/` directory

## Project Structure
- `public/` — static assets and `manifest.json`
- `src/` — React app code (UI components, background/service scripts)
- `vite.config.ts` — Vite config for extension targets
- `tsconfig.json` — TypeScript config
- `package.json` — scripts and dependencies

## Contributing
I welcome PRs and issues from the community. To keep reviews smooth:
- Fork the repo, create a branch (`feat/my-change`), and keep changes focused.
- Describe user-facing changes and include screenshots/GIFs when UI is affected.
- For extension behavior changes, note how to reproduce feature/change
